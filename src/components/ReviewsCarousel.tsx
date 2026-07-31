import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const REVIEWS = [
  {
    name: "Chioma E.",
    course: "Computer Science",
    comment: "I sold my old laptop within two days. Highly recommended for all students!",
    rating: 5,
  },
  {
    name: "Emeka O.",
    course: "Business Administration",
    comment: "Very easy to buy hostel essentials. Saved me a lot of stress.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    course: "Law",
    comment: "Got my textbooks here at half the price. The vendor was very polite and delivery was fast.",
    rating: 4,
  },
  {
    name: "Tobi A.",
    course: "Engineering",
    comment: "Great platform. UI is clean and the whole process feels very secure.",
    rating: 5,
  },
];

export function ReviewsCarousel() {
  const [allReviews, setAllReviews] = React.useState(REVIEWS);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('campusmarket_reviews') || '[]');
    const published = saved.filter((r: any) => r.status === 'published').map((r: any) => ({
      name: r.user,
      course: r.course || "Verified User",
      comment: r.comment,
      rating: r.rating
    }));
    if (published.length > 0) {
      setAllReviews([...published, ...REVIEWS]);
    }
  }, []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  React.useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div className="overflow-hidden py-8" ref={emblaRef}>
      <div className="flex gap-6">
        {allReviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4"
          >
            <div className="bg-card border border-border p-6 rounded-2xl h-full shadow-sm">
              <div className="flex gap-1 text-amber-500 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted-foreground opacity-30"}`}
                  />
                ))}
              </div>
              <p className="text-foreground text-sm italic mb-6">"{review.comment}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{review.name}</h4>
                  <p className="text-xs text-muted-foreground">{review.course}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
