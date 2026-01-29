"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, Text, Float } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";

export type DieType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

interface ThreeDieProps {
    rolling: boolean;
    result: number | null;
    type: DieType;
}

// Geometry Factory
const getGeometry = (type: DieType, radius: number) => {
    switch (type) {
        case "d4": return new THREE.TetrahedronGeometry(radius, 0);
        case "d6": return new THREE.BoxGeometry(radius * 1.5, radius * 1.5, radius * 1.5);
        case "d8": return new THREE.OctahedronGeometry(radius, 0);
        case "d10": return new THREE.IcosahedronGeometry(radius, 0); // Placeholder: D10 mapped on D20 for now
        case "d12": return new THREE.DodecahedronGeometry(radius, 0);
        case "d20": return new THREE.IcosahedronGeometry(radius, 0);
        default: return new THREE.IcosahedronGeometry(radius, 0);
    }
};

// Robust Face Detector (Groups by Normal)
const getDieFaces = (type: DieType, radius: number) => {
    const geom = getGeometry(type, radius);
    geom.computeVertexNormals();
    const nonIndexed = geom.toNonIndexed();
    const pos = nonIndexed.getAttribute("position");
    const norm = nonIndexed.getAttribute("normal");

    const facesGrouped: { [key: string]: { center: THREE.Vector3, normal: THREE.Vector3, up: THREE.Vector3 } } = {};

    for (let i = 0; i < pos.count; i += 3) {
        const v1 = new THREE.Vector3().fromBufferAttribute(pos, i);
        const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
        const v3 = new THREE.Vector3().fromBufferAttribute(pos, i + 2);

        const center = new THREE.Vector3().addVectors(v1, v2).add(v3).divideScalar(3);
        const normal = new THREE.Vector3().fromBufferAttribute(norm, i).normalize();

        // Key by normal direction (quantized to avoid float errors)
        const key = `${normal.x.toFixed(2)},${normal.y.toFixed(2)},${normal.z.toFixed(2)}`;

        if (!facesGrouped[key]) {
            // New Face found
            // Calculate Up vector (center -> v1)
            let up = new THREE.Vector3().subVectors(v1, center).normalize();

            // Special rotation adjustments for D12/D6 text legibility?
            // Defaulting to "Center -> Vertex" is usually good.

            facesGrouped[key] = { center, normal, up };
        } else {
            // Existing face (another triangle of same face), average the center?
            // For D12 (pentagon), center of one triangle isn't center of pentagon.
            // We should Average ALL centers for this normal.
            // But for simple "Place Text on Face", the first triangle's center is often "Good Enough" or "Off Center".
            // Let's IMPROVE: Accumulate centers.
            // Skipping complex averaging for speed for now; standard Box/Dodeca usually have symmetric tris.
            // Box: 2 tris. Center of tri 1 is offset. 
            // Better logic: Accumulate sum positions and count.
        }
    }

    // Better Aggregation Pass
    const groups: { [key: string]: THREE.Vector3[] } = {};
    const normals: { [key: string]: THREE.Vector3 } = {};

    for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(pos, i);
        const n = new THREE.Vector3().fromBufferAttribute(norm, i).normalize();
        const key = `${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`;

        if (!groups[key]) {
            groups[key] = [];
            normals[key] = n;
        }
        // Add unique vertices to group
        // If v is slightly diff, add it.
        // Actually, just average all vertices with same normal -> Center of Face.
        groups[key].push(v);
    }

    return Object.keys(groups).map(key => {
        const vertices = groups[key];
        const normal = normals[key];

        // Calc Bounding Box Center of Vertices
        const center = new THREE.Vector3();
        vertices.forEach(v => center.add(v));
        center.divideScalar(vertices.length);

        // Up vector: Center -> First Vertex
        const up = new THREE.Vector3().subVectors(vertices[0], center).normalize();

        return { center, normal, up };
    });
};

export function ActualDieMesh({ rolling, result, type }: ThreeDieProps) {
    const meshRef = useRef<THREE.Group>(null);
    const radius = 2;

    const faces = useMemo(() => {
        let f = getDieFaces(type, radius);
        // Sort faces to have consistent numbering order?
        // Random order is annoying.
        // Sort by Y then X?
        // Let's just shuffle deterministically or keep geometry order.
        // For D20, geometry order is usable.
        // For D6 (Cube), it's standard.
        // Limit to max number of that die type (D4->4 faces).
        return f.slice(0, parseInt(type.substring(1)) || 20);
    }, [type]);

    const [targetQuat, setTargetQuat] = useState(new THREE.Quaternion());
    const [isLanding, setIsLanding] = useState(false);

    useEffect(() => {
        if (rolling) {
            setIsLanding(false);
        } else if (result !== null && faces.length > 0) {
            // Find face index 
            // If result is 5, index is 4.
            const maxVal = faces.length;
            const resultIndex = (result - 1) % maxVal;

            // For D10 (simulated on D20), we map 1..10 to faces 0..9
            const face = faces[resultIndex];

            if (face) {
                const startNormal = face.normal.clone();
                const targetNormal = new THREE.Vector3(0, 0, 1);
                const q = new THREE.Quaternion().setFromUnitVectors(startNormal, targetNormal);
                setTargetQuat(q);
                setIsLanding(true);
            }
        }
    }, [rolling, result, faces]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        if (rolling) {
            meshRef.current.rotation.x += 15 * delta;
            meshRef.current.rotation.y += 10 * delta;
            meshRef.current.rotation.z += 8 * delta;
        } else if (isLanding) {
            meshRef.current.quaternion.slerp(targetQuat, 8 * delta);
        }
    });

    // Determine Geometry Component
    const Geometry = () => {
        if (type === "d4") return <tetrahedronGeometry args={[radius, 0]} />;
        if (type === "d6") return <boxGeometry args={[radius * 1.5, radius * 1.5, radius * 1.5]} />;
        if (type === "d8") return <octahedronGeometry args={[radius, 0]} />;
        if (type === "d10") return <icosahedronGeometry args={[radius, 0]} />; // Use D20 shape for now
        if (type === "d12") return <dodecahedronGeometry args={[radius, 0]} />;
        return <icosahedronGeometry args={[radius, 0]} />;
    };

    return (
        <group ref={meshRef}>
            <mesh>
                <Geometry />
                <meshStandardMaterial color="#991b1b" roughness={0.2} metalness={0.5} />
            </mesh>

            <lineSegments>
                {/* Wireframe helper - create geometry instance manually for Lines */}
                <lineBasicMaterial color="#fca5a5" opacity={0.3} transparent />
            </lineSegments>

            {faces.map((face, index) => {
                const number = index + 1;
                const textPos = face.center.clone().multiplyScalar(1.1); // Slightly out
                return (
                    <group key={index} position={textPos}>
                        <OrientedText normal={face.normal} up={face.up}>
                            <Text
                                fontSize={type === "d20" ? 0.6 : 1} // Larger text for D6/D8
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

function OrientedText({ children, normal, up }: { children: React.ReactNode, normal: THREE.Vector3, up: THREE.Vector3 }) {
    const groupRef = useRef<THREE.Group>(null);
    useEffect(() => {
        if (groupRef.current) {
            const zAxis = normal.clone().normalize();
            const yAxis = up.clone().normalize();
            const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
            const finalY = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
            const matrix = new THREE.Matrix4().makeBasis(xAxis, finalY, zAxis);
            groupRef.current.quaternion.setFromRotationMatrix(matrix);
        }
    }, [normal, up]);
    return <group ref={groupRef}>{children}</group>;
}

export function ThreeDie(props: ThreeDieProps) {
    return (
        <div className="w-full h-full relative flex items-center justify-center">
            {/* Centering Fix: Ensure Canvas is contained and centered */}
            <div className="w-[300px] h-[300px]">
                <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 10, 5]} intensity={1.5} />
                    <pointLight position={[-5, -5, -5]} color="orange" intensity={0.5} />
                    <Center>
                        <ActualDieMesh {...props} />
                    </Center>
                </Canvas>
            </div>
        </div>
    );
}
