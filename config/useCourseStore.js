import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCourseStore = create(
  persist(
    (set) => ({
      courses: [],
      loading: true,
      carouselIndex: 0,
      topSellingIndex: 0,
      discountIndex: 0,
      setCourses: (courses) => set({ courses, loading: false }),
      setLoading: (loading) => set({ loading }),
      setCarouselIndex: (i) => set({ carouselIndex: i }),
      setTopSellingIndex: (i) => set({ topSellingIndex: i }),
      setDiscountIndex: (i) => set({ discountIndex: i }),
    }),
    {
      name: "course-storage", // 🔑 stored in AsyncStorage
    }
  )
);
