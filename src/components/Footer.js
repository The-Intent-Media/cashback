import Link from "next/link"

export default function Footer(props) {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
          </div>
          
        </div>
        <div className="text-xs mt-2">
          <p>{props.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}

