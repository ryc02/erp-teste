import { useState, useMemo, useEffect } from 'react';

export function useLocalData<T extends { id?: any }>(initialData: T[], customItemsPerPage: number = 10) {
  const [data, setData] = useState<T[]>(initialData);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = customItemsPerPage;

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Filter based on any string value in the object
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lowerSearch = search.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page]);

  const add = (item: T) => {
    setData([item, ...data]);
    setPage(1); // Go back to first page
  };

  const remove = (id: string) => {
    setData(data.filter(i => i.id !== id));
  };

  const update = (id: string, updatedFields: Partial<T>) => {
    setData(data.map(i => i.id === id ? { ...i, ...updatedFields } : i));
  }

  return {
    data,
    search,
    setSearch: (s: string) => { setSearch(s); setPage(1); },
    page,
    setPage,
    totalPages,
    paginatedData,
    add,
    remove,
    update
  };
}
