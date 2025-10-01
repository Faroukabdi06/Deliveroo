import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";

const statusOrder = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function ParcelTimeline({ history }) {
  return (
    <div className="flex flex-col space-y-6">
      {statusOrder.map((status, index) => {
        const update = history.find((h) => h.status === status);
        const isCompleted = Boolean(update);

        return (
          <motion.div
            key={status}
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div>
              {isCompleted ? (
                <CheckCircle className="text-green-500 w-6 h-6" />
              ) : (
                <Clock className="text-gray-400 w-6 h-6" />
              )}
            </div>
            <div>
              <p className={`font-medium ${isCompleted ? "text-black" : "text-gray-400"}`}>
                {status}
              </p>
              {isCompleted && (
                <p className="text-xs text-gray-500">{update.timestamp}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
