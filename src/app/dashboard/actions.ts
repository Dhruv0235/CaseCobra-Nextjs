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

export async function getSalesCurrentYear() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const months = eachMonthOfInterval({ start: startOfYear, end: endOfYear });
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
