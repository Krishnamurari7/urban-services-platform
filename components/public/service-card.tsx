import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, ArrowRight } from "lucide-react";
import Image from "next/image";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string;
  basePrice: number;
  durationMinutes: number;
  imageUrl: string | null;
  rating?: number;
  reviewCount?: number;
}

export function ServiceCard({
  id,
  name,
  description,
  category,
  basePrice,
  durationMinutes,
  imageUrl,
  rating,
  reviewCount,
}: ServiceCardProps) {
  return (
    <Link href={`/services/${id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary/20">
        <div className="relative h-52 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-5xl font-bold text-primary/30 transition-transform duration-300 group-hover:scale-110">{name[0]}</span>
            </div>
          )}
          <Badge className="absolute right-3 top-3 capitalize shadow-md" variant="secondary">
            {category}
          </Badge>
        </div>
        <CardHeader className="pb-3">
          <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary transition-colors">{name}</h3>
          {description && (
            <p className="line-clamp-2 text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">Starting from</span>
              <span className="text-2xl font-bold">₹{basePrice}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span>{durationMinutes} min</span>
            </div>
          </div>
          {rating !== undefined && reviewCount !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t">
          <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Book Now <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
