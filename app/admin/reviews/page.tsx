import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { approveReview, rejectReview, hideReview, showReview } from "./actions";
import { Star, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

async function getReviews() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    // Get all reviews with related data
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        is_visible,
        is_verified,
        created_at,
        updated_at,
        customer:profiles!reviews_customer_id_fkey(
          id,
          full_name,
          email
        ),
        professional:profiles!reviews_professional_id_fkey(
          id,
          full_name
        ),
        service:services(
          id,
          name,
          category
        ),
        booking:bookings(
          id,
          status
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    return reviews || [];
  } catch (error) {
    console.error("Unexpected error fetching reviews:", error);
    return [];
  }
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  const visibleReviews = reviews.filter((r: any) => r.is_visible);
  const hiddenReviews = reviews.filter((r: any) => !r.is_visible);
  const pendingReviews = reviews.filter((r: any) => !r.is_verified);

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-blue-50 mt-1">
          Manage and moderate customer reviews
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Reviews</CardTitle>
            <span className="text-3xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">All reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Visible</CardTitle>
            <span className="text-3xl">👁️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{visibleReviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">Public reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Hidden</CardTitle>
            <span className="text-3xl">🚫</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{hiddenReviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">Hidden reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending</CardTitle>
            <span className="text-3xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingReviews.length}</div>
            <p className="text-xs text-gray-500 mt-1">Need verification</p>
          </CardContent>
        </Card>
      </div>

      {/* All Reviews */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">All Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews found</p>
            ) : (
              reviews.map((review: any, index: number) => {
                const gradients = review.is_visible 
                  ? [
                      "from-blue-400 to-cyan-500",
                      "from-purple-400 to-pink-500",
                      "from-green-400 to-emerald-500",
                      "from-indigo-400 to-blue-500",
                    ]
                  : [
                      "from-red-400 to-rose-500",
                      "from-orange-400 to-red-500",
                    ];
                const gradient = gradients[index % gradients.length];
                return (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                          <span className="ml-1 font-medium">
                            {review.rating}/5
                          </span>
                        </div>
                        <Badge
                          variant={
                            review.is_visible ? "default" : "destructive"
                          }
                          className="gap-1"
                        >
                          {review.is_visible ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </>
                          )}
                        </Badge>
                        {review.is_verified && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-700 mb-3">
                          {review.comment}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {review.customer?.full_name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Professional:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {review.professional?.full_name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Service:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {review.service?.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {review.is_visible ? (
                        <form action={hideReview}>
                          <input
                            type="hidden"
                            name="reviewId"
                            value={review.id}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide
                          </Button>
                        </form>
                      ) : (
                        <form action={showReview}>
                          <input
                            type="hidden"
                            name="reviewId"
                            value={review.id}
                          />
                          <Button type="submit" variant="default" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Show
                          </Button>
                        </form>
                      )}
                      {!review.is_verified && (
                        <form action={approveReview}>
                          <input
                            type="hidden"
                            name="reviewId"
                            value={review.id}
                          />
                          <Button type="submit" variant="default" size="sm">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </form>
                      )}
                      <form action={rejectReview}>
                        <input
                          type="hidden"
                          name="reviewId"
                          value={review.id}
                        />
                        <Button type="submit" variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
