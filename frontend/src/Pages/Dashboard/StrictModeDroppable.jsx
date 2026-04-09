import { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";

export function StrictModeDroppable(props) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setIsEnabled(true);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      setIsEnabled(false);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return <Droppable {...props} />;
}
