"use client";

import React, { useEffect, useState } from 'react';
import './d20.css';

interface CssD20Props {
    result: number | null;
    rolling: boolean;
    onAnimationComplete?: () => void;
}

export function CssD20({ result, rolling, onAnimationComplete }: CssD20Props) {
    const [animationClass, setAnimationClass] = useState("");

    useEffect(() => {
        if (rolling) {
            setAnimationClass("rolling"); // Start chaotic spin
        } else if (result !== null) {
            // Land on specific number
            // In a real physics engine we'd calculate rotation. 
            // For CSS, we cheat by showing the result on text but stopping animation at a "Generic Front Face".
            // Or we can map results to specific rotations (tedious for CSS).
            // Let's do a simple "Spin -> Stop -> Fade in Result" flow.
            setAnimationClass("show-result");
            if (onAnimationComplete) setTimeout(onAnimationComplete, 1000);
        }
    }, [rolling, result]);

    return (
        <div className="scene">
            <div className={`d20 ${animationClass}`}>
                {/* Icosahedron Faces (20) */}
                {/* CSS construction requires 20 faces with specific transforms */}
                {/* We will use a simplified visual representation or SVG for stability if CSS is too complex to inject inline. */}
                {/* Actually building a full CSS icosahedron is verbose. Let's use a clever SVG or a simpler HTML structure? */}
                {/* Let's stick to the Classic "CSS Only D20" structure found in codepens, adapted for React. */}

                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`face face-${i + 1}`}>
                        {/* Only show number if stopped? or always? */}
                        {/* For simplicity: we map result to the "Front" face (Face 1) when stopped. */}
                        {/* During roll, numbers blur. */}
                        {/* Actually, let's just put random numbers on faces for realism. */}
                    </div>
                ))}

                {/* When stopped, we overlay the result nicely or ensure Face 1 rotates to front */}
            </div>

            {/* Result Overlay (Cheating the 3D rotation math) */}
            {!rolling && result !== null && (
                <div className="d20-result-overlay">
                    {result}
                </div>
            )}
        </div>
    );
}
