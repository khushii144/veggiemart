import Link from 'next/link';

export default function BlogCard({ blog }) {
  return (
    <div className="bg-white border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
      <div>
        {/* Image Container with tag */}
        <Link href={`/blog/${blog.id}`} className="block">
          <div className="relative h-[220px] w-full overflow-hidden select-none">
            <img
              src={blog.image}
              alt={blog.title}
              className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">
              {blog.category}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-6">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2">
            {blog.date}
          </span>
          <Link href={`/blog/${blog.id}`}>
            <h3 className="text-lg font-extrabold text-gray-900 leading-snug hover:text-green-600 transition-colors line-clamp-2 mb-2.5">
              {blog.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed line-clamp-3">
            {blog.excerpt}
          </p>
        </div>
      </div>

      {/* Action Button Section (Brand green matching the logo color theme) */}
      <div className="px-6 pb-6 pt-2">
        <Link
          href={`/blog/${blog.id}`}
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] px-4 py-2.5 transition-all duration-300 uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-green-650/10"
        >
          Read Story &rarr;
        </Link>
      </div>
    </div>
  );
}
