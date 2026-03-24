import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { session } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLists([]);
      setLoading(false);
      return;
    }

    fetchLists();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, fetchLists)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchLists)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session]);

  async function fetchLists() {
    const { data, error } = await supabase
      .from('lists')
      .select('*, items(*)')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setLists(
        data.map((l) => ({
          ...l,
          items: (l.items || []).sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          ),
        }))
      );
    }
    setLoading(false);
  }

  async function addList(name) {
    await supabase.from('lists').insert({
      name,
      owner_id: session.user.id,
      is_shared: false,
    });
  }

  async function deleteList(id) {
    await supabase.from('lists').delete().eq('id', id);
  }

  async function renameList(id, name) {
    await supabase.from('lists').update({ name }).eq('id', id);
  }

  async function toggleShared(id, current) {
    await supabase.from('lists').update({ is_shared: !current }).eq('id', id);
  }

  async function addItem(listId, text) {
    await supabase.from('items').insert({ list_id: listId, text, checked: false });
  }

  async function toggleItem(itemId, current) {
    await supabase.from('items').update({ checked: !current }).eq('id', itemId);
  }

  async function deleteItem(itemId) {
    await supabase.from('items').delete().eq('id', itemId);
  }

  async function uncheckAll(listId) {
    await supabase.from('items').update({ checked: false }).eq('list_id', listId);
  }

  return (
    <AppContext.Provider value={{
      lists,
      loading,
      addList,
      deleteList,
      renameList,
      toggleShared,
      addItem,
      toggleItem,
      deleteItem,
      uncheckAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
