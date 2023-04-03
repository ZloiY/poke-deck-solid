import type { ZodSchema, z } from "zod";

export const getQueryParams = <SchemaType extends ZodSchema>(
  path: string,
  zodScheme: SchemaType,
): z.infer<SchemaType> | Record<string, string> => {
  const queryStr = path.split("?")[1] ?? "";
  const queryParams = queryStr.split("&")?.reduce((params, keyValue) => {
    const [key, value] = keyValue.split("=");
    return { ...params, [key]: value };
  }, {} as { [key: string]: string });
  const validatedQuery = zodScheme.safeParse(queryParams);
  if (validatedQuery.success) {
    return validatedQuery.data;
  } else {
    return queryParams;
  }
};

