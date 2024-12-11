import { Suspense } from "react";
import ProfilePageContent from "./profilePageContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading Profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
