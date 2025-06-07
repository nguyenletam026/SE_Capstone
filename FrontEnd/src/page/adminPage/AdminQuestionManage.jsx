import { useState, useEffect } from "react";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../lib/admin/questionServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  HiPlus,
  HiTrash,
  HiPencil,
  HiSearch,
  HiX,
  HiExclamation,
} from "react-icons/hi";
import AdminLayout from "../../components/layouts/adminLayout";

const AdminQuestionManage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    content: "",
    options: ["", ""],
    optionStressScores: [0, 0],
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (error) {
      toast.error("Failed to load question list.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
      optionStressScores: [...formData.optionStressScores, 0],
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      toast.warning("At least 2 options are required.");
      return;
    }

    const newOptions = formData.options.filter((_, i) => i !== index);
    const newScores = formData.optionStressScores.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      options: newOptions,
      optionStressScores: newScores,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;

    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleScoreChange = (index, value) => {
    const score = parseFloat(value);
    if (isNaN(score) || score < 0 || score > 100) {
      return;
    }

    const newScores = [...formData.optionStressScores];
    newScores[index] = score;

    setFormData({
      ...formData,
      optionStressScores: newScores,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.content.trim()) {
      toast.error("Please enter the question content.");
      return;
    }

    for (let i = 0; i < formData.options.length; i++) {
      if (!formData.options[i].trim()) {
        toast.error(`Please enter content for option ${i + 1}.`);
        return;
      }
    }

    try {
      setLoading(true);

      if (isEditing && currentQuestion) {
        await updateQuestion(currentQuestion.id, formData);
        toast.success("Question updated successfully.");
      } else {
        await createQuestion(formData);
        toast.success("Question created successfully.");
      }

      setShowModal(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update question." : "Failed to create question."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setCurrentQuestion(question);
    setFormData({
      content: question.content,
      options: [...question.options],
      optionStressScores:
        question.optionStressScores ||
        Array(question.options.length).fill(0),
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (question) => {
    setCurrentQuestion(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentQuestion) return;

    try {
      setLoading(true);
      await deleteQuestion(currentQuestion.id);
      toast.success("Question deleted successfully.");
      setShowDeleteModal(false);
      fetchQuestions();
    } catch (error) {
      toast.error("Failed to delete question.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setCurrentQuestion(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      content: "",
      options: ["", ""],
      optionStressScores: [0, 0],
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span role="img" aria-label="note">
            📝
          </span>
          Manage Assessment Questions
        </h2>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <HiSearch />
            </span>
            <input
              type="text"
              placeholder="Search questions..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition"
            onClick={openAddModal}
          >
            <HiPlus className="text-lg" />
            Add Question
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="w-full text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 border-b font-semibold">
                    Question Content
                  </th>
                  <th className="px-6 py-3 border-b font-semibold">
                    Number of Options
                  </th>
                  <th className="px-6 py-3 border-b font-semibold">
                    Created By
                  </th>
                  <th className="px-6 py-3 border-b font-semibold">
                    Created At
                  </th>
                  <th className="px-6 py-3 border-b font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {questions
                  .filter((question) =>
                    question.content
                      .toLowerCase()
                      .includes(filter.toLowerCase())
                  )
                  .map((question) => (
                    <tr
                      key={question.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 border-b font-medium text-gray-800">
                        {question.content.length > 100
                          ? `${question.content.substring(0, 100)}...`
                          : question.content}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-600">
                        {question.options.length}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-600">
                        {question.createdBy || "Admin"}
                      </td>
                      <td className="px-6 py-4 border-b text-gray-600">
                        {formatDate(question.createdAt)}
                      </td>
                      <td className="px-6 py-4 border-b space-x-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition"
                          onClick={() => handleEdit(question)}
                        >
                          <HiPencil className="inline mr-1" />
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          onClick={() => handleDelete(question)}
                        >
                          <HiTrash className="inline mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                {questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No questions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for adding/editing a question */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditing ? "Edit Question" : "Add New Question"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter question content..."
                    required
                  ></textarea>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 font-medium">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <HiPlus className="mr-1" /> Add Option
                    </button>
                  </div>

                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-3 gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          value={formData.optionStressScores[index]}
                          onChange={(e) =>
                            handleScoreChange(index, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Stress Score"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove option"
                      >
                        <HiTrash size={20} />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    * Stress score from 0-100. The higher the score, the greater the stress.
                  </p>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                  >
                    {loading
                      ? "Processing..."
                      : isEditing
                      ? "Update"
                      : "Create Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4 text-red-500">
                  <HiExclamation size={50} />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete this question? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-70"
                  >
                    {loading ? "Processing..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </AdminLayout>
  );
};

export default AdminQuestionManage;