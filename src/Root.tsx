import { Composition } from "remotion";
import { DroneShort, DRONE_FRAMES } from "./videos/drone/DroneShort";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DroneShort"
        component={DroneShort}
        durationInFrames={DRONE_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
