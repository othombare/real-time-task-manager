import { MessageSquareIcon, SendHorizonalIcon, SparklesIcon, UsersIcon } from "lucide-react";
import DashboardLayout from "../Dashboard/DashboardLayout";



function Message() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            
            <h1 className="text-3xl font-bold tracking-tight">Message</h1>
            
          </div>

          
          
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Message;
