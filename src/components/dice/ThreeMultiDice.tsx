"use client";

import { Canvas } from "@react-three/fiber";
import { Center, Float, Environment } from "@react-three/drei";
import { ActualDieMesh, DieType } from "./ThreeDie";

interface ThreeMultiDiceProps {
    rolling: boolean;
    results: number[]; // Array of results, one per die
    type: DieType;
}

export function ThreeMultiDice({ rolling, results, type }: ThreeMultiDiceProps) {
    // Calculate positions for dice
    // If 1: [0,0,0]
    // If 4: 2x2 grid or linear
    // Let's do linear if count <= 4, Grid if more.

    // Hardcoded positions for common counts
    const getPosition = (index: number, total: number): [number, number, number] => {
        if (total === 1) return [0, 0, 0];

        if (total === 4) {
            // 2x2 Grid
            const row = Math.floor(index / 2); // 0 or 1
            const col = index % 2; // 0 or 1
            // Center is 0.5, 0.5
            // x: (col - 0.5) * spacing
            // y: (row - 0.5) * spacing
            return [(col - 0.5) * 4, (0.5 - row) * 4, 0];
        }

        // Default Linear
        const spacing = 4;
        const startX = -((total - 1) * spacing) / 2;
        return [startX + index * spacing, 0, 0];
    };

    return (
        <div className="w-full h-full relative flex items-center justify-center">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} color="orange" intensity={0.5} />

                <Center>
                    <group>
                        {results.map((res, i) => (
                            <group key={i} position={getPosition(i, results.length)}>
                                <Float speed={2 + i * 0.2} rotationIntensity={0.5} floatIntensity={0.2}>
                                    {/* Each die gets its own result. If rolling, result is passed but ignored by visual logic until !rolling */}
                                    <ActualDieMesh rolling={rolling} result={res} type={type} />
                                </Float>
                            </group>
                        ))}
                    </group>
                </Center>
            </Canvas>
        </div>
    );
}
