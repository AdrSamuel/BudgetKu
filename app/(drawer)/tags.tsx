import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import useStore from "@/store/store";

const Tags = () => {
  const { tags, addTag, editTag, deleteTag } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim());
      setNewTagName("");
      setModalVisible(false);
    }
  };

  const handleEditTag = () => {
    if (newTagName.trim() && selectedTag) {
      editTag(selectedTag, newTagName.trim());
      setNewTagName("");
      setSelectedTag("");
      setModalVisible(false);
    }
  };

  const handleDeleteTag = () => {
    if (selectedTag) {
      deleteTag(selectedTag);
      setSelectedTag("");
      setModalVisible(false);
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.tagItem}
      onPress={() => {
        setSelectedTag(item);
        setNewTagName(item);
        setIsEditing(true);
        setModalVisible(true);
      }}
    >
      <Text style={styles.tagText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors["dark"].background }]}
    >
      <Text style={styles.content}>Expense Tags : </Text>
      <View style={styles.separator} />

      <FlatList
        data={tags}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => {
              setIsEditing(false);
              setNewTagName("");
              setModalVisible(true);
            }}
          >
            <Text style={styles.addTagButtonText}>+ Add New Tag</Text>
          </TouchableOpacity>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="Enter tag name"
              placeholderTextColor="#928374"
            />
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleEditTag}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteTag}
                >
                  <Text style={styles.buttonText}>Delete Tag</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleAddTag}>
                <Text style={styles.buttonText}>Add Tag</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["dark"].background,
  },
  content: {
    fontFamily: "PlusJakartaSans",
    color: "#fbf1c7",
    fontSize: 20,
    padding: 20,
    paddingTop: 0,
  },
  separator: {
    borderBottomColor: "#fbf1c7",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tagItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  tagText: {
    color: "#fbf1c7",
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
  },
  addTagButton: {
    padding: 15,
    alignItems: "center",
  },
  addTagButtonText: {
    color: "#83a598",
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors["dark"].background,
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    color: "#fbf1c7",
    fontFamily: "PlusJakartaSans",
  },
  button: {
    backgroundColor: "#d5c4a1",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Colors["dark"].background,
    fontSize: 16,
    fontFamily: "PlusJakartaSans",
  },
  deleteButton: {
    backgroundColor: "#cc2412",
  },
  saveButton: {
    backgroundColor: "#98971a",
  },
});

export default Tags;
