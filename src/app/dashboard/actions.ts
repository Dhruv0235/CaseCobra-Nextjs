"use server";

import { db } from "@/db";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  eachWeekOfInterval,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import { OrderStatus } from "@prisma/client";

export async function changeOrderStatus({
  id,
  newStatus,
}: {
  id: string;
  newStatus: OrderStatus;
}) {
  await db.order.update({
    where: {
      id: id,
    },
    data: {
      status: newStatus,
    },
  });
}

export async function getSalesLast12Months() {
  const now = new Date();
  const startOfLast12Months = subMonths(now, 11); // Get the date 11 months before now

  const months = eachMonthOfInterval({ start: startOfLast12Months, end: now });
  const monthlySales = await Promise.all(
    months.map(async (month) => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);

      const totalSales = await db.order.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: start, lte: end },
          isPaid: true,
        },
      });

      return {
        month: format(start, "MMM yyyy"),
        totalSales: totalSales._sum.amount || 0,
      };
    }),
  );

  // Get total sales for each week in the current month
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);

  const weeks = eachWeekOfInterval({
    start: startOfCurrentMonth,
    end: endOfCurrentMonth,
  });
  const weeklySales = await Promise.all(
    weeks.map(async (week) => {
      const start = startOfWeek(week);
      const end = endOfWeek(week);

      const totalSales = await db.order.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: start, lte: end },
          isPaid: true,
        },
      });

      return {
        week: `${format(start, "dd MMM")} - ${format(end, "dd MMM")}`,
        totalSales: totalSales._sum.amount || 0,
      };
    }),
  );

  return { monthlySales, weeklySales };
}
