import os
import httpx
from urllib.parse import quote
from src.services.db import execute_query

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are AURA's shopping assistant for an online clothing store.
Help customers with:
- Product questions (materials, sizing, styling, care)
- Styling advice ("what goes with...", "complete the look", outfit ideas)
- Order status (ask for an order number if they want to look one up)

Be warm, concise, and practical. Pay close attention to whether the user is looking for Men's, Women's, or Kids' clothing, and tailor your recommendations accordingly. Recommend items from the catalog context when relevant,
and refer to them by name. If you don't know something, say so and suggest browsing the site
or using visual search. Never invent order details or prices.
Format responses with short paragraphs or bullet lists. Use **bold** for key names
and prices. When recommending a catalog item, include its exact provided product
link using Markdown: [Product name](/product/product-slug). Use only the product
URLs supplied in the catalog context; never invent a URL. Do not output HTML."""

class NLPChatService:
    @staticmethod
    def chat(messages) -> str:
        """
        Sends the chat turns to an LLM with live catalog context.
        Prefers Gemini (GEMINI_API_KEY), with Groq available when Gemini
        is not configured. Uses demo mode if neither provider is set.
        """
        gemini_key = os.getenv("GEMINI_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        # Determine context to filter by gender
        conversation_text = " ".join([m.get("content", "").lower() for m in messages if m.get("role") == "user"])
        target_gender = None
        # Kids takes precedence if mentioned, then women, then men
        if any(w in conversation_text.split() for w in ["kid", "kids", "child", "children"]):
            target_gender = "kids"
        elif any(w in conversation_text.split() for w in ["women", "womens", "woman", "women's", "woman's", "girl", "girls"]):
            target_gender = "women"
        elif any(w in conversation_text.split() for w in ["men", "mens", "man", "men's", "man's", "boy", "boys"]):
            target_gender = "men"

        query = (
            'SELECT p.name, p.slug, p.brand, p.gender, p."basePrice", c.name as category_name '
            'FROM "Product" p '
            'JOIN "Category" c ON p."categoryId" = c.id '
            'WHERE p.active = true '
        )
        
        if target_gender == "kids":
            query += "AND p.gender ILIKE 'kids' "
        elif target_gender == "women":
            query += "AND (p.gender ILIKE 'women' OR p.gender ILIKE 'unisex') "
        elif target_gender == "men":
            query += "AND (p.gender ILIKE 'men' OR p.gender ILIKE 'unisex') "
            
        query += "ORDER BY RANDOM() LIMIT 20"

        # Get live catalog context (limit 20)
        try:
            products = execute_query(query)
            catalog_lines = []
            for p in products:
                brand_str = f" by {p['brand']}" if p['brand'] else ""
                gender_str = f" ({p['gender']})" if p['gender'] else ""
                product_link = f"/product/{quote(p['slug'], safe='')}"
                catalog_lines.append(f"- [{p['name']}]({product_link}){brand_str} ({p['category_name']}{gender_str}) ${float(p['basePrice']):.2f}")
            catalog = "\n".join(catalog_lines)
        except Exception as e:
            print("DB error fetching catalog for chat context:", e)
            catalog = "Catalog details temporarily unavailable."

        system_prompt = f"{SYSTEM_PROMPT}\n\nCurrent catalog (sample):\n{catalog}"
        formatted_messages = [
            {"role": m.get("role", "user").lower(), "content": m.get("content", "")}
            for m in messages
            if m.get("role", "user").lower() in ("user", "assistant")
            and m.get("content", "").strip()
        ]

        if not formatted_messages:
            return "What would you like help finding in our clothing collection?"

        if gemini_key:
            model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
            try:
                resp = httpx.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    headers={"x-goog-api-key": gemini_key, "Content-Type": "application/json"},
                    json={
                        "systemInstruction": {"parts": [{"text": system_prompt}]},
                        "contents": [
                            {
                                "role": "model" if turn["role"] == "assistant" else "user",
                                "parts": [{"text": turn["content"]}],
                            }
                            for turn in formatted_messages
                        ],
                        "generationConfig": {"maxOutputTokens": 4096},
                    },
                    timeout=30.0,
                )
                resp.raise_for_status()
                candidates = resp.json().get("candidates") or []
                parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
                reply = "\n".join(
                    part["text"] for part in parts if part.get("text") and not part.get("thought")
                ).strip()
                return reply or "I couldn't answer that request. Please try asking about our clothing collection."
            except httpx.HTTPStatusError as error:
                # Log status only; never log the request headers or API key.
                print("Gemini chat request failed with HTTP status:", error.response.status_code)
            except (httpx.RequestError, ValueError, TypeError, KeyError) as error:
                print("Gemini chat request failed:", type(error).__name__)
            return "I'm having trouble reaching the styling service right now. Please try again."

        if groq_key:
            try:
                model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
                payload = {
                    "model": model,
                    "max_tokens": 700,
                    "messages": [{"role": "system", "content": system_prompt}] + formatted_messages,
                }
                resp = httpx.post(
                    GROQ_CHAT_URL,
                    headers={
                        "Authorization": f"Bearer {groq_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=30.0,
                )
                resp.raise_for_status()
                data = resp.json()
                reply_text = data["choices"][0]["message"]["content"]
                return reply_text.strip() or "Sorry, I couldn't process that response."
            except Exception as e:
                print("Groq Chat error:", e)
                return "I'm having trouble reaching the styling service right now. Please try again."

        return (
            "Live styling advice is currently unavailable. "
            "Try browsing our collections, or upload a photo to use Visual Search."
        )

    @staticmethod
    def get_review_fit_summary(product_id: str) -> dict:
        """
        Parses all reviews for a product to extract and summarize size/fit signals.
        Returns fit stats (runs small, runs large, true to size).
        """
        try:
            reviews = execute_query(
                'SELECT rating, body, title FROM "Review" WHERE "productId" = %s',
                (product_id,)
            )
        except Exception as e:
            print("DB error fetching reviews:", e)
            reviews = []

        if not reviews:
            return {
                "summary": "No reviews yet",
                "countSmall": 0,
                "countLarge": 0,
                "countTrue": 0,
                "confidence": 0.0,
                "rationale": "No reviews have been submitted for this garment yet to estimate fit."
            }

        # NLP keyword heuristic to scan review content
        small_keywords = ["small", "tight", "restrictive", "short", "narrow", "size up", "sizing up"]
        large_keywords = ["large", "loose", "big", "baggy", "wide", "size down", "sizing down"]
        true_keywords = ["true to size", "perfect", "fits well", "fits perfectly", "fits great"]

        small_votes = 0
        large_votes = 0
        true_votes = 0

        for r in reviews:
            content = f"{r['title'] or ''} {r['body']}".lower()
            
            # Analyze keywords
            is_small = any(k in content for k in small_keywords)
            is_large = any(k in content for k in large_keywords)
            is_true = any(k in content for k in true_keywords)

            # If rating is 4 or 5 and no negative size indicators, count as true to size
            if r['rating'] >= 4 and not (is_small or is_large):
                is_true = True

            if is_small:
                small_votes += 1
            if is_large:
                large_votes += 1
            if is_true:
                true_votes += 1

        total_votes = small_votes + large_votes + true_votes
        if total_votes == 0:
            # Fallback to rating average
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
            if avg_rating >= 4.0:
                summary = "Fits True to Size"
                true_votes = len(reviews)
            else:
                summary = "Varying Fit Opinions"
                small_votes = len(reviews) // 2
                large_votes = len(reviews) - small_votes
            total_votes = len(reviews)

        # Decide summary text
        if true_votes >= max(small_votes, large_votes):
            summary = "Fits True to Size"
            percentage = (true_votes / total_votes) * 100
            rationale = f"{percentage:.0f}% of buyers report this item fits exactly as expected."
        elif small_votes > large_votes:
            summary = "Runs Slightly Small"
            percentage = (small_votes / total_votes) * 100
            rationale = f"{percentage:.0f}% of reviews mention a tighter fit. We recommend sizing up."
        else:
            summary = "Runs Slightly Large"
            percentage = (large_votes / total_votes) * 100
            rationale = f"{percentage:.0f}% of reviews mention a loose fit. We recommend sizing down."

        confidence = min(0.95, max(0.5, total_votes / (len(reviews) + 1)))

        return {
            "summary": summary,
            "countSmall": small_votes,
            "countLarge": large_votes,
            "countTrue": true_votes,
            "confidence": round(confidence, 2),
            "rationale": rationale
        }
