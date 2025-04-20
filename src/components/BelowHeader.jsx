import { Card } from "./UI/CardComp";
import { Button } from "./UI/Button";
import { MoreHorizontal } from "lucide-react";

function BelowHeader() {
  return (
    <Card className="p-2  bg-gray-200 my-4 flex justify-center ">
      <div className="flex space-x-2">
        <Button variant="ghost" size="sm" className="text-blue-500">
          <svg
            className="w-5 h-5 mr-1"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.03 2.6a3 3 0 0 1 5.94 0L15 8.5a3 3 0 0 1-2 4.48v4.02a1 1 0 0 1-2 0v-4.02a3 3 0 0 1-2-4.48l2.03-5.9zM10 15a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1z"
              fill="currentColor"
            />
          </svg>
          Hot
        </Button>
        <Button variant="ghost" size="sm">
          Everywhere
        </Button>
        <Button variant="ghost" size="sm">
          New
        </Button>
        <Button variant="ghost" size="sm">
          Top
        </Button>
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      {/* <p className="mt-2 text-red-500">BelowHeader is rendering</p>{" "}
      Added for visibility */}
    </Card>
  );
}

export default BelowHeader;
