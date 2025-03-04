"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

// Bubble component remains the same
function Bubble({
  x,
  y,
  size,
  color,
}: {
  x: number
  y: number
  size: number
  color: string
}) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.7, 0.3, 0.7],
        scale: [1, 1.2, 1],
        cx: [x, x + Math.random() * 100 - 50, x],
        cy: [y, y + Math.random() * 100 - 50, y],
      }}
      transition={{
        duration: 5 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

export default function FloatingBubblesBackground({
  title = "checkout the chat for workouts",
}: {
  title?: string
}) {
  const words = title.split(" ")
  const [bubbles, setBubbles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string }>
  >([])

  useEffect(() => {
    // Function to create bubbles
    const createBubbles = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      const newBubbles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 20 + 5,
        color: `rgba(${Math.random() * 255},${Math.random() * 255},${
          Math.random() * 255
        },0.3)`,
      }))

      setBubbles(newBubbles)
    }

    // Initial creation
    createBubbles()

    // Handle window resize
    const handleResize = () => {
      createBubbles()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(to bottom right, #E0F7FA, #E8EAF6)",
      }}
    >
      {/* Background SVG with bubbles */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        <svg width="100%" height="100%">
          {bubbles.map((bubble) => (
            <Bubble key={bubble.id} {...bubble} />
          ))}
        </svg>
      </div>

      {/* Content container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: "100%",
          maxWidth: "1000px",
          padding: "0 20px",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: "5rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            background: "linear-gradient(to right, #1565C0, #7B1FA2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{ display: "inline-block", marginRight: "0.5rem" }}
            >
              <Link href="/chat">{word}</Link>
            </span>
          ))}
        </h1>

        <div
          style={{
            display: "inline-block",
            background: "rgba(255, 255, 255, 0.2)",
            padding: "1px",
            borderRadius: "1rem",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            style={{
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              fontWeight: "600",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              color: "#3B82F6",
              border: "none",
              borderRadius: "0.95rem",
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link href="/chat">
              <span>Checkout the Workout Chat</span>
            </Link>
            <span style={{ marginLeft: "0.5rem" }}>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
