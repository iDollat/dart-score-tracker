type Props = {
  step: number;
};

export function RegisterProgress({ step }: Props) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-2">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`h-2 rounded-full ${
            item <= step ? "bg-primary" : "bg-secondary"
          }`}
        />
      ))}
    </div>
  );
}