/**
 * "About me" as a hanging ID badge: my photo on the card, swinging from a strap. Drag it around.
 */
"use client";

import Lanyard from "./Lanyard";

export default function AboutLanyard({ photo }: { photo: string }) {
  return (
    <div className="h-[26rem] w-full md:h-[30rem]">
      <Lanyard
        frontImage={photo}
        imageFit="cover"
        cardColor="#ffffff"
        orientation="portrait"
        finish="glossy"
        cornerRadius={0.3}
        size={0.6}
        anchor="center"
        strapLength={0.5}
        strapColor="#1f1f23"
        strapWidth={0.65}
        metal="silver"
        interactive
        intro
      />
    </div>
  );
}
