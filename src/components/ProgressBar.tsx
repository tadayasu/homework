interface ProgressBarProps {
  done: number
  total: number
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">今日の進み具合</span>
        <span className="text-sm font-bold text-gray-900">
          {done} / {total} 完了
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor:
              percentage === 100
                ? "#22c55e"
                : percentage >= 50
                  ? "#3b82f6"
                  : "#f59e0b",
          }}
        />
      </div>
      {percentage === 100 && (
        <p className="text-center text-green-600 font-bold mt-2 text-sm">
          🎉 全部終わった！すごい！
        </p>
      )}
    </div>
  )
}
