export function ScanlineEffect() {
  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            oklch(0 0 0 / 0) 0px,
            oklch(0 0 0 / 0) 2px,
            oklch(0.75 0.20 145 / 0.03) 2px,
            oklch(0.75 0.20 145 / 0.03) 4px
          )`,
          animation: 'scan 8s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes scan {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(100%);
            }
          }
        `}
      </style>
    </div>
  )
}
