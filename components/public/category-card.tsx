import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface CategoryCardProps {
  name: string;
  description: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  href: string;
  serviceCount?: number;
}

export function CategoryCard({
  name,
  description,
  imageUrl,
  icon,
  href,
  serviceCount,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/20">
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="transition-transform duration-300 group-hover:scale-110">
                {icon || (
                  <span className="text-5xl font-bold text-primary/50">
                    {name[0]}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {description}
              </p>
              {serviceCount !== undefined && (
                <p className="text-xs font-medium text-primary/80">
                  {serviceCount} {serviceCount === 1 ? 'service' : 'services'} available
                </p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all ml-2 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
