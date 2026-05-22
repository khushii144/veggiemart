import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogs } from '@/lib/blogs';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';

export default async function BlogDetailPage({ params }) {
  const { id } = await params;
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    notFound();
  }

  // Get other/recent stories
  const recentStories = blogs.filter((b) => b.id !== id);

  const renderContent = (text) => {
    return text.split('\n\n').map((para, index) => {
      // Heading 3
      if (para.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg sm:text-xl font-black text-gray-900 mt-6 mb-3 pt-4 border-t border-gray-50 uppercase tracking-wide">
            {para.replace('### ', '')}
          </h3>
        );
      }
      
      // Unordered lists
      if (para.startsWith('- ') || para.startsWith('* ')) {
        const items = para.split('\n');
        return (
          <ul key={index} className="list-disc pl-5 space-y-2 my-4 text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }

      // Ordered lists
      if (/^\d+\./.test(para)) {
        const items = para.split('\n');
        return (
          <ol key={index} className="list-decimal pl-5 space-y-2 my-4 text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      // Normal paragraph
      return (
        <p key={index} className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold mb-4">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-green-600 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: Main Blog Post Content */}
        <article className="lg:col-span-8 space-y-6">
          
          {/* Header Metadata */}
          <div className="space-y-3">
            <span className="inline-block bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 border border-green-100/50 shadow-sm">
              {blog.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest pt-1 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-green-600" />
                {blog.date}
              </span>
              <span className="text-gray-250">|</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-green-600" />
                By Organic Vatika Editor
              </span>
            </div>
          </div>

          {/* Large Featured Image (No rounded corners, straight edges) */}
          <div className="relative h-[250px] sm:h-[350px] lg:h-[420px] w-full overflow-hidden bg-gray-55 border border-gray-150">
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="object-cover h-full w-full select-none pointer-events-none"
            />
          </div>

          {/* Full content body text */}
          <div className="prose prose-sm max-w-none text-gray-700">
            {renderContent(blog.content)}
          </div>
        </article>

        {/* RIGHT COLUMN: Sidebar (Inspired directly by screenshot) */}
        <aside className="lg:col-span-4 space-y-8 lg:border-l lg:border-gray-100 lg:pl-8">
          
          {/* Categories Section (Identical to reference layout) */}
          <div className="bg-white border border-gray-100 p-6">
            <h3 className="text-xs font-black uppercase text-gray-900 border-b-2 border-green-600 pb-2.5 inline-block tracking-widest">
              Categories
            </h3>
            <div className="mt-5 space-y-3.5 divide-y divide-gray-50">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-3.5 first:pt-0">
                <span className="hover:text-green-600 transition-colors cursor-pointer">Wellness</span>
                <span className="text-gray-400 font-medium">(1)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-3.5">
                <span className="hover:text-green-600 transition-colors cursor-pointer">Farming</span>
                <span className="text-gray-400 font-medium">(1)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-3.5">
                <span className="hover:text-green-600 transition-colors cursor-pointer">Nutrition</span>
                <span className="text-gray-400 font-medium">(1)</span>
              </div>
            </div>
          </div>

          {/* Recent Stories Section (Identical to reference layout) */}
          <div className="bg-white border border-gray-100 p-6">
            <h3 className="text-xs font-black uppercase text-gray-900 border-b-2 border-green-600 pb-2.5 inline-block tracking-widest">
              Recent Stories
            </h3>
            <div className="mt-5 space-y-4">
              {recentStories.map((story) => (
                <Link 
                  key={story.id} 
                  href={`/blog/${story.id}`} 
                  className="flex gap-3 group"
                >
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-gray-50 border border-gray-150">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none" 
                    />
                  </div>
                  <div className="space-y-1 my-auto">
                    <h4 className="text-[11px] font-extrabold text-gray-900 leading-snug group-hover:text-green-600 transition-colors line-clamp-2">
                      {story.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-bold block">{story.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
