"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text, Float } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";

interface ThreeD20Props {
    rolling: boolean;
    result: number | null;
}

const getFaceData = (radius: number) => {
    try {
        const geom = new THREE.IcosahedronGeometry(radius, 0);
        const nonIndexed = geom.toNonIndexed();
        const pos = nonIndexed.getAttribute("position");
        const faces = [];

        for (let i = 0; i < pos.count; i += 3) {
            const v1 = new THREE.Vector3().fromBufferAttribute(pos, i);
            const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
            const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

            const center = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3);
            const normal = center.clone().normalize();

            // To orient text "upright", we need a consistent Up vector.
            // For a triangle pointing up, v1 is usually top?
            // Let's pick the vector from center to v1 as "Up".
            // We might need to try v2 or v3 if the text looks rotated 120 degrees.
            // But consistently using v1 ensures they are at least "aligned" to the shape.
            const up = new THREE.Vector3().subVectors(v1, center).normalize();

            faces.push({ center, normal, up });
        }
        return faces.slice(0, 20);
    } catch (e) {
        return [];
    }
};

function DieMesh({ rolling, result }: ThreeD20Props) {
    const meshRef = useRef<THREE.Group>(null);
    const radius = 2;
    const faces = useMemo(() => getFaceData(radius), []);
    const safeFaces = faces.length === 20 ? faces : [];

    const [targetQuat, setTargetQuat] = useState(new THREE.Quaternion());
    const [isLanding, setIsLanding] = useState(false);

    useEffect(() => {
        if (rolling) {
            setIsLanding(false);
        } else if (result !== null && safeFaces.length > 0) {
            const resultIndex = (result - 1) % 20;
            const face = safeFaces[resultIndex];
            if (face) {
                const startNormal = face.normal.clone();
                const targetNormal = new THREE.Vector3(0, 0, 1);
                const q = new THREE.Quaternion().setFromUnitVectors(startNormal, targetNormal);
                setTargetQuat(q);
                setIsLanding(true);
            }
        }
    }, [rolling, result, safeFaces]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        if (rolling) {
            meshRef.current.rotation.x += 15 * delta;
            meshRef.current.rotation.y += 10 * delta;
            meshRef.current.rotation.z += 8 * delta;
        } else if (isLanding) {
            meshRef.current.quaternion.slerp(targetQuat, 5 * delta);
        }
    });

    return (
        <group ref={meshRef}>
            <mesh>
                <icosahedronGeometry args={[radius, 0]} />
                <meshStandardMaterial color="#991b1b" roughness={0.2} metalness={0.5} />
            </mesh>

            <lineSegments>
                <wireframeGeometry args={[new THREE.IcosahedronGeometry(radius, 0)]} />
                <lineBasicMaterial color="#fca5a5" opacity={0.4} transparent />
            </lineSegments>

            {safeFaces.map((face, index) => {
                const number = index + 1;
                const textPos = face.center.clone().multiplyScalar(1.03);
                return (
                    <group key={index} position={textPos}>
                        <OrientedText normal={face.normal} up={face.up}>
                            <Text
                                fontSize={0.6}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {number}
                            </Text>
                        </OrientedText>
                    </group>
                );
            })}
        </group>
    );
}

// Custom rotation helper
function OrientedText({ children, normal, up }: { children: React.ReactNode, normal: THREE.Vector3, up: THREE.Vector3 }) {
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (groupRef.current) {
            // 1. Look at the normal (this aligns Z axis)
            const target = new THREE.Vector3().addVectors(groupRef.current.position, normal);
            groupRef.current.lookAt(target);

            // 2. Now spin around the Z-axis (normal) to match the 'up' vector
            // This is tricky because lookAt sets an arbitrary up.
            // Let's rely on constructing the matrix manually for perfect control.

            const zAxis = normal.clone().normalize();
            const yAxis = up.clone().normalize();
            // yAxis might not be perpendicular to zAxis, so project it?
            // Usually on a face, 'up' (center->v1) is on the plane, so it IS perpendicular to normal (center->out).

            const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

            // Re-calculate Y to be perfectly ortho
            const finalY = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

            const matrix = new THREE.Matrix4().makeBasis(xAxis, finalY, zAxis);
            groupRef.current.quaternion.setFromRotationMatrix(matrix);
        }
    }, [normal, up]);

    return <group ref={groupRef}>{children}</group>;
}

export function ThreeD20({ rolling, result }: ThreeD20Props) {
    return (
        <div className="w-full h-[300px] relative">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} color="orange" intensity={0.5} />
                <Center>
                    <DieMesh rolling={rolling} result={result} />
                </Center>
            </Canvas>
        </div>
    );
}
