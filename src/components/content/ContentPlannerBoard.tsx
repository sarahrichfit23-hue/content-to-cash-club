import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const columnConfig = {
  todo: { name: "To Do", color: "#FFF7E6" },
  inprogress: { name: "In Progress", color: "#E6F7FF" },
  done: { name: "Published", color: "#F6FFED" },
  archived: { name: "Archived", color: "#F4F4F4" },
};

const emptyCard = {
  id: "",
  column: "todo",
  title: "",
  notes: "",
  checklist: [],
  links: [],
  images: [],
  due_date: "",
  created_at: "",
  updated_at: "",
};

const ADD_OPTIONS = [
  { key: "checklist", label: "Checklist Item" },
  { key: "link", label: "Link" },
  { key: "image", label: "Image" },
  { key: "notes", label: "Notes" },
];

function checklistToObjects(arr) {
  return (arr || []).map(item =>
    typeof item === "string"
      ? { text: item, checked: false }
      : { text: item.text || "", checked: !!item.checked }
  );
}

export default function ContentPlannerBoard() {
  const [user, setUser] = useState(null);
  const [columns, setColumns] = useState({
    todo: { ...columnConfig.todo, items: [] },
    inprogress: { ...columnConfig.inprogress, items: [] },
    done: { ...columnConfig.done, items: [] },
    archived: { ...columnConfig.archived, items: [] },
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCol, setSelectedCol] = useState("todo");
  const [cardData, setCardData] = useState(emptyCard);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addSection, setAddSection] = useState("checklist");
  const [lastArchivedCard, setLastArchivedCard] = useState(null);
  const [lastDeletedCard, setLastDeletedCard] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ block: "center" });
    }
  }, [modalOpen]);

  const fetchCards = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("kanban_cards")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      console.error("Error loading cards:", error.message);
      setLoading(false);
      return;
    }
    const grouped = { todo: [], inprogress: [], done: [], archived: [] };
    (data || []).forEach((card) => {
      card.checklist = checklistToObjects(card.checklist);
      if (grouped[card.column]) grouped[card.column].push(card);
    });
    setColumns({
      todo: { ...columnConfig.todo, items: grouped.todo },
      inprogress: { ...columnConfig.inprogress, items: grouped.inprogress },
      done: { ...columnConfig.done, items: grouped.done },
      archived: { ...columnConfig.archived, items: grouped.archived },
    });
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    fetchCards();
  }, [user]);

  async function uploadImage(file) {
    if (!file || !user?.id) return null;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${uuidv4()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('kanban-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) {
      alert("Error uploading image: " + error.message);
      setUploading(false);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('kanban-images')
      .getPublicUrl(fileName);
    setUploading(false);
    return urlData.publicUrl;
  }

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!cardData.title || !user?.id) return;
    const checklist = checklistToObjects(cardData.checklist);
    let result;
    if (editMode) {
      result = await supabase
        .from("kanban_cards")
        .update({
          ...cardData,
          checklist,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardData.id);
    } else {
      result = await supabase
        .from("kanban_cards")
        .insert([
          {
            ...cardData,
            id: uuidv4(),
            user_id: user.id,
            column: selectedCol,
            checklist,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
    }
    if (result.error) {
      alert("Error saving card: " + result.error.message);
    } else {
      setModalOpen(false);
      setCardData(emptyCard);
      setEditMode(false);
      fetchCards();
    }
  };

  const handleRemoveCard = async (colId, cardId) => {
    const cardToDelete = columns[colId].items.find(c => c.id === cardId);
    const { error } = await supabase.from("kanban_cards").delete().eq("id", cardId);
    if (error) alert("Error removing card: " + error.message);
    else {
      setLastDeletedCard(cardToDelete);
      setShowUndo("delete");
      setModalOpen(false);
      fetchCards();
      setTimeout(() => setShowUndo(false), 7000);
    }
  };

  const handleArchiveCard = async (cardId, colId) => {
    const card = columns[colId].items.find(c => c.id === cardId);
    const { error } = await supabase
      .from("kanban_cards")
      .update({ column: "archived", updated_at: new Date().toISOString() })
      .eq("id", cardId);
    if (error) alert("Error archiving card: " + error.message);
    else {
      setLastArchivedCard({ ...card, column: colId });
      setShowUndo("archive");
      fetchCards();
      setTimeout(() => setShowUndo(false), 7000);
    }
  };

  const handleUndoArchive = async () => {
    if (!lastArchivedCard) return;
    const { id, column } = lastArchivedCard;
    await supabase
      .from("kanban_cards")
      .update({ column, updated_at: new Date().toISOString() })
      .eq("id", id);
    setShowUndo(false);
    setLastArchivedCard(null);
    fetchCards();
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedCard) return;
    const { id, ...rest } = lastDeletedCard;
    await supabase
      .from("kanban_cards")
      .insert([{ ...rest, id }]);
    setShowUndo(false);
    setLastDeletedCard(null);
    fetchCards();
  };

  async function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceItems = [...sourceCol.items];
    const [moved] = sourceItems.splice(source.index, 1);

    await supabase
      .from("kanban_cards")
      .update({ column: destination.droppableId, updated_at: new Date().toISOString() })
      .eq("id", moved.id);

    fetchCards();
  }

  const openAddCard = (colId) => {
    setSelectedCol(colId);
    setEditMode(false);
    setCardData({
      ...emptyCard,
      checklist: [],
      due_date: "",
      column: colId,
    });
    setModalOpen(true);
    setAddSection("checklist");
  };

  const openEditCard = (colId, card) => {
    setSelectedCol(colId);
    setEditMode(true);
    setCardData({
      ...card,
      checklist: checklistToObjects(card.checklist || []),
    });
    setModalOpen(true);
    setAddSection("checklist");
  };

  const addChecklistItem = () => {
    setCardData({
      ...cardData,
      checklist: [...cardData.checklist, { text: "", checked: false }],
    });
  };
  const updateChecklistItem = (idx, val) => {
    const newChecklist = [...cardData.checklist];
    newChecklist[idx] = { ...newChecklist[idx], text: val };
    setCardData({ ...cardData, checklist: newChecklist });
  };
  const removeChecklistItem = (idx) => {
    const newChecklist = cardData.checklist.filter((_, i) => i !== idx);
    setCardData({ ...cardData, checklist: newChecklist });
  };
  const toggleChecklistComplete = (idx) => {
    const newChecklist = [...cardData.checklist];
    newChecklist[idx] = { ...newChecklist[idx], checked: !newChecklist[idx].checked };
    setCardData({ ...cardData, checklist: newChecklist });
  };

  const addLink = () => setCardData({ ...cardData, links: [...cardData.links, ""] });
  const updateLink = (idx, val) => {
    const newLinks = [...cardData.links];
    newLinks[idx] = val;
    setCardData({ ...cardData, links: newLinks });
  };
  const removeLink = (idx) => {
    const newLinks = cardData.links.filter((_, i) => i !== idx);
    setCardData({ ...cardData, links: newLinks });
  };

  const addImage = () => setCardData({ ...cardData, images: [...cardData.images, ""] });
  const updateImage = (idx, val) => {
    const newImages = [...cardData.images];
    newImages[idx] = val;
    setCardData({ ...cardData, images: newImages });
  };
  const removeImage = (idx) => {
    const newImages = cardData.images.filter((_, i) => i !== idx);
    setCardData({ ...cardData, images: newImages });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large! Max size is 5MB.");
        return;
      }
      const allowed = ["image/jpeg", "image/png", "image/gif"];
      if (!allowed.includes(file.type)) {
        alert("Only jpg, png, or gif files allowed.");
        return;
      }
      const url = await uploadImage(file);
      if (url) setCardData((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const updateDueDate = (val) => setCardData({ ...cardData, due_date: val });

  const modalStyle = {
    marginTop: "80px",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  return (
    <div className="flex flex-col gap-4 p-6 overflow-x-auto">
      <div className="mb-2 text-sm text-yellow-700 font-medium">
        Tip: Drag cards by the <span style={{fontWeight: 'bold'}}>vertical ⋮ handle</span> to move them between columns.
      </div>
      {showUndo && (
        <div className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2 bg-yellow-700 text-white px-4 py-2 rounded shadow-lg flex items-center gap-4">
          {showUndo === "archive" && (
            <>
              Card archived.
              <Button size="sm" className="bg-white text-yellow-700 hover:bg-yellow-100" onClick={handleUndoArchive}>
                Undo
              </Button>
            </>
          )}
          {showUndo === "delete" && (
            <>
              Card deleted.
              <Button size="sm" className="bg-white text-yellow-700 hover:bg-yellow-100" onClick={handleUndoDelete}>
                Undo
              </Button>
            </>
          )}
        </div>
      )}
      <div className="flex gap-6">
        {loading ? (
          <div className="text-center p-8 w-full text-lg text-yellow-600">Loading your board...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).map(([colId, col]) => (
              <Droppable droppableId={colId} key={colId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="w-80 min-w-[20rem] flex-shrink-0"
                  >
                    <div
                      className="rounded-t-xl p-4 font-bold text-lg mb-2"
                      style={{ background: col.color }}
                    >
                      {col.name}
                    </div>
                    <div className="space-y-4">
                      {col.items.map((item, idx) => (
                        <Draggable key={item.id} draggableId={item.id} index={idx}>
                          {(prov) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className="bg-white shadow hover:shadow-lg transition rounded select-none flex"
                              style={{
                                ...prov.draggableProps.style,
                                boxShadow: prov.isDragging ? '0 2px 8px rgba(0,0,0,0.2)' : undefined,
                              }}
                            >
                              {/* Drag Handle */}
                              <div
                                {...prov.dragHandleProps}
                                className="flex items-center px-2 cursor-grab text-2xl select-none"
                                style={{ userSelect: "none" }}
                                title="Drag to move"
                              >
                                ⋮
                              </div>
                              <div className="flex-1">
                                <CardContent className="p-4">
                                  <div className="text-xs text-gray-500 mb-2">
                                    {item.due_date
                                      ? `Due: ${new Date(item.due_date).toLocaleDateString()}`
                                      : item.created_at
                                      ? `Created: ${new Date(item.created_at).toLocaleDateString()}`
                                      : ""}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="font-semibold mb-1">{item.title}</div>
                                    {colId !== "archived" && (
                                      <button
                                        type="button"
                                        className="text-yellow-700 hover:underline text-xs ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditCard(colId, item);
                                        }}
                                        tabIndex={0}
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{item.notes}</div>
                                  {item.checklist?.length > 0 && (
                                    <div className="mb-2">
                                      {item.checklist.map((c, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                          <input
                                            type="checkbox"
                                            checked={!!c.checked}
                                            readOnly
                                          />
                                          <span className={`text-xs ${c.checked ? "line-through text-gray-400" : "text-gray-700"}`}>{c.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {item.links?.length > 0 && (
                                    <div className="mb-1">
                                      {item.links.map((l, i) =>
                                        l ? (
                                          <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline block">
                                            {l}
                                          </a>
                                        ) : null
                                      )}
                                    </div>
                                  )}
                                  {item.images?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mb-2">
                                      {item.images.map((img, i) =>
                                        img ? (
                                          <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                            <img src={img} alt={`img-${i}`} className="w-16 h-16 object-cover rounded border" />
                                          </a>
                                        ) : null
                                      )}
                                    </div>
                                  )}
                                  <div className="flex gap-2 mt-2">
                                    {colId !== "archived" && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="bg-yellow-700 text-white hover:bg-yellow-800"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCard(colId, item.id);
                                          }}
                                        >
                                          Remove
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-yellow-700 text-yellow-700 hover:bg-yellow-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleArchiveCard(item.id, colId);
                                          }}
                                        >
                                          Archive
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </CardContent>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                    {colId !== "archived" && (
                      <Button className="mt-4 w-full" onClick={() => openAddCard(colId)}>
                        + Add Card
                      </Button>
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        )}
      </div>
      {modalOpen && (
        <div
          className="fixed z-40 left-0 w-full h-full flex items-center justify-center bg-black/40"
          style={{ top: 0 }}
        >
          <form
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
            ref={modalRef}
            style={modalStyle}
            onSubmit={handleCardSubmit}
          >
            <div className="text-lg font-bold mb-2">{editMode ? "Edit Card" : "Add Card"}</div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Due Date (optional)</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={cardData.due_date}
                onChange={(e) => updateDueDate(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Title <span className="text-red-600">*</span></label>
              <input
                className="w-full border rounded px-3 py-2"
                value={cardData.title}
                onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                required
                placeholder="Card title (required)"
              />
              <div className="text-xs text-gray-400 mt-1">Title is required to save a card.</div>
            </div>
            <div className="mb-2">
              <label className="block font-medium mb-1">Notes</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                value={cardData.notes}
                onChange={(e) => setCardData({ ...cardData, notes: e.target.value })}
                placeholder="Type notes here..."
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">
                What do you want to add?
              </label>
              <select
                className="w-full border rounded px-2 py-1"
                value={addSection}
                onChange={(e) => setAddSection(e.target.value)}
              >
                {ADD_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>
            {addSection === "checklist" && (
              <div className="mb-2">
                <label className="block font-medium mb-1">Checklist</label>
                {cardData.checklist.map((c, i) => (
                  <div key={i} className="flex gap-2 items-center mb-1">
                    <input
                      type="checkbox"
                      checked={!!c.checked}
                      onChange={() => toggleChecklistComplete(i)}
                    />
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      value={c.text}
                      onChange={(e) => updateChecklistItem(i, e.target.value)}
                      placeholder="Checklist item"
                    />
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeChecklistItem(i)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={addChecklistItem}>+ Add Checklist Item</Button>
              </div>
            )}
            {addSection === "link" && (
              <div className="mb-2">
                <label className="block font-medium mb-1">Links</label>
                {cardData.links.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      value={l}
                      onChange={(e) => updateLink(i, e.target.value)}
                      placeholder="https://..."
                    />
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeLink(i)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={addLink}>+ Add Link</Button>
              </div>
            )}
            {addSection === "image" && (
              <div className="mb-2">
                <label className="block font-medium mb-1">Images</label>
                {cardData.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-1 items-center">
                    <input
                      className="flex-1 border rounded px-2 py-1"
                      value={img}
                      onChange={(e) => updateImage(i, e.target.value)}
                      placeholder="https://image-url.com/photo.jpg"
                    />
                    {img && (
                      <a href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt={`img-${i}`} className="w-8 h-8 object-cover rounded border" />
                      </a>
                    )}
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeImage(i)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={addImage}>+ Add Image (URL)</Button>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    disabled={uploading}
                    onChange={handleImageUpload}
                    className="block"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Upload image (jpg, png, gif), max 5MB. Uploaded images are stored securely and only you can access them.
                  </div>
                  {uploading && <div className="text-xs text-blue-500 mt-1">Uploading image...</div>}
                </div>
              </div>
            )}
            {addSection === "notes" && (
              <div className="mb-2">
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={cardData.notes}
                  onChange={(e) => setCardData({ ...cardData, notes: e.target.value })}
                  placeholder="Type notes here..."
                />
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="flex-1" disabled={uploading}>
                {editMode ? "Save" : "Add"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}