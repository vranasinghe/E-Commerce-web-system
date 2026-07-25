export function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#e6186c]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-bold text-neutral-900 md:text-3xl">
        {title}
      </h2>
    </div>
  );
}
