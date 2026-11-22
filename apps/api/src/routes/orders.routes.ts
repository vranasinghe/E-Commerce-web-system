import { Router } from "express";
import { orderService } from "../services/order.service";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

export const orderRoutes = Router();

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

orderRoutes.get("/", requireAuth, async (req: any, res, next) => {
  try {
    const isStaffOrAdmin = req.user.role === "STAFF" || req.user.role === "ADMIN";
    const orders = await orderService.list(isStaffOrAdmin ? undefined : req.user.id);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// Requires login; customers can only read their own orders (staff can read any).
orderRoutes.get("/:orderNumber", requireAuth, async (req: any, res, next) => {
  try {
    const order = await orderService.getByNumber(req.params.orderNumber);
    const isStaffOrAdmin = req.user.role === "STAFF" || req.user.role === "ADMIN";
    if (!order || (order.userId !== req.user.id && !isStaffOrAdmin)) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

orderRoutes.patch("/:id/status", requireAuth, requireRole(["ADMIN", "STAFF"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, note } = req.body as {
      status: string;
      trackingNumber?: string;
      carrier?: string;
      note?: string;
    };
    if (!id) return res.status(400).json({ error: "id required" });
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: "invalid status" });
    }
    const order = await orderService.updateStatus(id, status, { trackingNumber, carrier, note });

    // Simulated Shipped Email Notification
    if (status === "SHIPPED") {
      console.log(`
============================================================
📧 EMAIL SENT [Order Shipped]
To: ${order.email}
Subject: Your AURA Order has Shipped! - ${order.orderNumber}

Great news! Your package is on the way.
Order Number: ${order.orderNumber}
Tracking Number: ${order.trackingNumber || "AURA-TRK-12345"}
============================================================
      `);
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
});
