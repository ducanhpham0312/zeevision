import {
  useQuery,
  DocumentNode,
  QueryHookOptions,
  OperationVariables,
  QueryResult,
} from "@apollo/client";
import { useEffect } from "react";
import { useTableStore } from "../contexts/useTableStore";

function useQueryWithLoading<TData, TVariables extends OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): QueryResult<any, TVariables> {
  const { setLoading } = useTableStore();
  const result = useQuery<TData, TVariables>(query, options);

  useEffect(() => {
    setLoading(result.loading);
  }, [result.loading, setLoading]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result;
}

export default useQueryWithLoading;
