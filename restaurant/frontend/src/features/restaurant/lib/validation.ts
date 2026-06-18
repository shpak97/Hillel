import { SLUG_REGEX } from '@/features/restaurant/lib/slug';

export const MAX_RESTAURANT_PHOTOS = 20;

export type CreateRestaurantFormValues = {
  title: string;
  slug: string;
  description: string;
  address: string;
  photos: File[];
};

export type CreateRestaurantFormErrors = Partial<
  Record<keyof CreateRestaurantFormValues | 'photos', string>
>;

export function validateCreateRestaurantForm(
  values: CreateRestaurantFormValues,
): CreateRestaurantFormErrors {
  const errors: CreateRestaurantFormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Введіть назву ресторану';
  } else if (values.title.trim().length < 2) {
    errors.title = 'Назва має містити щонайменше 2 символи';
  }

  if (!values.slug.trim()) {
    errors.slug = 'Введіть slug';
  } else if (!SLUG_REGEX.test(values.slug.trim())) {
    errors.slug =
      'Slug може містити лише малі латинські літери, цифри та дефіс';
  }

  if (!values.description.trim()) {
    errors.description = 'Введіть опис ресторану';
  }

  if (values.address.trim().length > 500) {
    errors.address = 'Адреса не може перевищувати 500 символів';
  }

  if (values.photos.length > MAX_RESTAURANT_PHOTOS) {
    errors.photos = `Максимум ${MAX_RESTAURANT_PHOTOS} фото`;
  }

  return errors;
}
