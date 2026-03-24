import { useLayoutEffect, useState } from 'react';
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
import TodoItem from '../components/TodoItem';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function ListScreen({ route, navigation }) {
  const { listId } = route.params;
  const { lists, addItem, toggleItem, deleteItem, uncheckAll, renameList, toggleShared } = useApp();
  const { session } = useAuth();
  const { colors } = useTheme();
  const [newItemText, setNewItemText] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  const list = lists.find((l) => l.id === listId);
  const isOwner = list?.owner_id === session?.user?.id;

  useLayoutEffect(() => {
    if (!list) return;
    navigation.setOptions({
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      title: '',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleRefresh}
          style={[styles.refreshBtn, { backgroundColor: colors.primaryLight }]}
        >
          <Text style={[styles.refreshText, { color: colors.primary }]}>Tout decocher</Text>
        </TouchableOpacity>
      ),
    });
  }, [list, colors]);

  if (!list) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  async function handleAddItem() {
    const text = newItemText.trim();
    if (!text) return;
    setAdding(true);
    await addItem(listId, text);
    setNewItemText('');
    setAdding(false);
  }

  function handleRefresh() {
    const hasChecked = list.items.some((i) => i.checked);
    if (!hasChecked) return;
    Alert.alert('Tout decocher', 'Decocher tous les elements ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Decocher tout', onPress: () => uncheckAll(listId) },
    ]);
  }

  async function handleRenameSubmit() {
    const name = nameValue.trim();
    if (name && name !== list.name) await renameList(listId, name);
    setEditingName(false);
  }

  async function handleToggleShared() {
    await toggleShared(listId, list.is_shared);
  }

  const checkedCount = list.items.filter((i) => i.checked).length;
  const totalCount = list.items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;
  const allDone = totalCount > 0 && checkedCount === totalCount;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {/* Title + sharing */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            {editingName ? (
              <TextInput
                style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.primary }]}
                value={nameValue}
                onChangeText={setNameValue}
                onBlur={handleRenameSubmit}
                onSubmitEditing={handleRenameSubmit}
                autoFocus
                maxLength={60}
              />
            ) : (
              <TouchableOpacity
                onPress={() => { if (isOwner) { setNameValue(list.name); setEditingName(true); } }}
              >
                <Text style={[styles.titleText, { color: colors.text }]}>{list.name}</Text>
                {isOwner && (
                  <Text style={[styles.editHint, { color: colors.textMuted }]}>Appuyer pour renommer</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {isOwner && (
            <TouchableOpacity
              style={[
                styles.shareBtn,
                {
                  backgroundColor: list.is_shared ? colors.primaryLight : colors.surfaceAlt,
                  borderColor: list.is_shared ? colors.primary : colors.border,
                },
              ]}
              onPress={handleToggleShared}
            >
              <Text style={[styles.shareIcon]}>🔗</Text>
              <Text style={[styles.shareText, { color: list.is_shared ? colors.primary : colors.textSecondary }]}>
                {list.is_shared ? 'Partagee' : 'Partager'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: allDone ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            {totalCount === 0 ? 'Vide' : `${checkedCount} / ${totalCount}`}
          </Text>
        </View>

        {allDone && (
          <View style={[styles.doneBadge, { backgroundColor: colors.success + '22' }]}>
            <Text style={[styles.doneText, { color: colors.success }]}>Tout est fait !</Text>
          </View>
        )}

        {/* Items */}
        <FlatList
          data={list.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onToggle={() => toggleItem(item.id, item.checked)}
              onDelete={() => deleteItem(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.emptyIcon}>✏️</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Liste vide</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Ajoutez votre premier element ci-dessous
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
            placeholder="Ajouter un element..."
            placeholderTextColor={colors.textMuted}
            value={newItemText}
            onChangeText={setNewItemText}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: newItemText.trim() ? colors.primary : colors.border }]}
            onPress={handleAddItem}
            disabled={!newItemText.trim() || adding}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 12,
  },
  titleLeft: { flex: 1 },
  titleText: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  editHint: { fontSize: 11, marginTop: 3 },
  titleInput: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  shareIcon: { fontSize: 13 },
  shareText: { fontSize: 13, fontWeight: '600' },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 6 },
  progressLabel: { fontSize: 13, minWidth: 48, textAlign: 'right' },
  doneBadge: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneText: { fontWeight: '700', fontSize: 14 },
  listContent: { paddingBottom: 8, flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
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
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 4,
  },
  refreshText: { fontSize: 13, fontWeight: '600' },
});
