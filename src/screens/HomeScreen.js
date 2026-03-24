import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListCard from '../components/ListCard';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { lists, loading, addList, deleteList } = useApp();
  const { signOut, session } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [newListName, setNewListName] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAddList() {
    const name = newListName.trim();
    if (!name) return;
    setAdding(true);
    await addList(name);
    setNewListName('');
    setAdding(false);
  }

  function handleDeleteList(id) {
    Alert.alert('Supprimer la liste', 'Cette action est irreversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteList(id) },
    ]);
  }

  function handleSignOut() {
    Alert.alert('Deconnexion', 'Veux-tu te deconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Deconnecter', style: 'destructive', onPress: signOut },
    ]);
  }

  const totalItems = lists.reduce((acc, l) => acc + l.items.length, 0);
  const totalChecked = lists.reduce((acc, l) => acc + l.items.filter((i) => i.checked).length, 0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Mes listes</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
              {session?.user?.email}
            </Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Text style={styles.iconBtnText}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleSignOut}
            >
              <Text style={styles.iconBtnText}>↩</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {lists.length > 0 && (
          <View style={[styles.statsCard, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{lists.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>liste{lists.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{totalItems}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>elements</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{totalChecked}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>faits</Text>
            </View>
          </View>
        )}

        {/* List */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListCard
                list={item}
                onPress={() => navigation.navigate('List', { listId: item.id })}
                onDelete={() => handleDeleteList(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.emptyIcon}>📋</Text>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune liste</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Creez votre premiere liste ci-dessous
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
            placeholder="Nouvelle liste..."
            placeholderTextColor={colors.textMuted}
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={handleAddList}
            returnKeyType="done"
            maxLength={60}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: newListName.trim() ? colors.primary : colors.border }]}
            onPress={handleAddList}
            disabled={!newListName.trim() || adding}
          >
            {adding
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.addBtnText}>+</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  email: { fontSize: 13, marginTop: 3 },
  headerBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconBtnText: { fontSize: 18 },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30 },
  listContent: { paddingBottom: 8, flexGrow: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    borderWidth: 1,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 26, lineHeight: 30, fontWeight: '300' },
});
