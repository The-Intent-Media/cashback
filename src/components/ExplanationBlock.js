  export default function ExplanationBlock({ title, description , className}) {
    return (
      <div className={`rounded-lg p-8 ${className}`}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="">{description}</p>
      </div>
    )
  }
  
  