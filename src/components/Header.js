import Link from "next/link"
import Image from "next/image"

export default function Header(props) {
  console.log(props)
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          {props.title}
        </Link>
      </div>
    </header>
  )
}

