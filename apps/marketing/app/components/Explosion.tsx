import { useViewportSize } from "@mantine/hooks";
import Confetti from "react-confetti";

export function Explosion({
  onConfettiComplete,
}: {
  onConfettiComplete: () => void;
}) {
  const { width, height } = useViewportSize();

  return (
    <div className="h-screen w-screen fixed z-50 inset-0">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        onConfettiComplete={onConfettiComplete}
      />
    </div>
  );
}
