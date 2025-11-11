import Link from 'next/link'
import Image from 'next/image'

export default function AuthorBio() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 my-12">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Image 
          src="/flo.jpg" 
          alt="Florian Hohenleitner - Event Organizer, Podcast Host & Founder of Flow Grid"
          width={128}
          height={128}
          className="w-32 h-32 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">About the Author</h3>
          <p className="text-lg font-semibold text-gray-800 mb-3">Florian Hohenleitner</p>
          <p className="text-gray-700 mb-4">
            Flo is an event organizer, podcast host, and creator passionate about helping people grow and connect. 
            After leaving corporate life, he trained as a yoga teacher in Bali, became a Thai massage practitioner, 
            and now co-organizes the Mediterranean Acro Convention while hosting the <em>Grow with the Flo</em> podcast. 
            He creates tools like Flow Grid to help event organizers build meaningful experiences.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="https://florianhohenleitner.com" 
              target="_blank"
              rel="noopener noreferrer author"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              🌐 florianhohenleitner.com →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
