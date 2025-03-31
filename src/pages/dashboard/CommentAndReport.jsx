import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";

const TABLE_HEAD = [
  "Comment ID",
  "Author",
  "Content",
  "Created At",
  "Reports Count",
  "Status",
  "Actions",
];

const CommentAndReport = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [openReportsDialog, setOpenReportsDialog] = useState(false);
  const [currentReports, setCurrentReports] = useState([]);

  useEffect(() => {
    fetchCommentsWithReports();
  }, []);

  const fetchCommentsWithReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/comment-reports/comments-with-reports"
      );
      setComments(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch comments");
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/comment-reports/comment/${selectedComment.id}`
      );
      toast.success("Comment deleted successfully");
      fetchCommentsWithReports();
    } catch (error) {
      toast.error("Failed to delete comment");
      console.error("Error deleting comment:", error);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedComment(null);
    }
  };

  const handleViewReports = (comment) => {
    setSelectedComment(comment);
    setCurrentReports(comment.reports || []);
    setOpenReportsDialog(true);
  };

  const filteredComments = comments.filter((comment) => {
    const commentText = comment.comment || "";
    const username = comment.User?.username || comment.User?.email || "";

    const matchesSearch =
      commentText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "reported" && comment.reportCount > 0) ||
      (selectedStatus === "clean" && comment.reportCount === 0);

    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (comment) => {
    if (!comment.reportCount || comment.reportCount === 0) {
      return <Chip color="green" value="Clean" size="sm" />;
    } else if (comment.reportCount > 3) {
      return <Chip color="red" value="Critical" size="sm" />;
    } else {
      return <Chip color="amber" value="Reported" size="sm" />;
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h2" className="mb-6">
        Comment Management
      </Typography>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-72">
            <Input
              label="Search comments"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-56">
            <Select
              label="Filter by status"
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
            >
              <Option value="all">All Comments</Option>
              <Option value="reported">Reported Only</Option>
              <Option value="clean">Clean Only</Option>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Typography variant="h5">Loading comments...</Typography>
        </div>
      ) : (
        <Card className="overflow-scroll">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="even:bg-blue-gray-50/50">
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {comment.id}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {comment.User?.username ||
                        comment.User?.email ||
                        "Anonymous"}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="max-w-xs truncate"
                    >
                      {comment.comment}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography variant="small" color="blue-gray">
                      {comment.reportCount || 0}
                    </Typography>
                  </td>
                  <td className="p-4">{getStatusChip(comment)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        size="sm"
                        color="blue"
                        onClick={() => handleViewReports(comment)}
                        disabled={
                          !comment.reportCount || comment.reportCount === 0
                        }
                      >
                        View Reports
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        color="red"
                        onClick={() => {
                          setSelectedComment(comment);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredComments.length === 0 && (
            <div className="p-8 text-center">
              <Typography variant="h5" color="blue-gray">
                No comments found
              </Typography>
            </div>
          )}
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        handler={() => setOpenDeleteDialog(!openDeleteDialog)}
      >
        <DialogHeader>Delete Comment</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this comment? This action cannot be
          undone.
          {selectedComment && (
            <div className="mt-4 p-4 bg-blue-gray-50 rounded">
              <Typography variant="small" className="font-bold">
                Comment Content:
              </Typography>
              <Typography variant="small">{selectedComment.comment}</Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={handleDeleteComment}>
            Confirm Delete
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog
        open={openReportsDialog}
        handler={() => setOpenReportsDialog(!openReportsDialog)}
        size="xl"
      >
        <DialogHeader>
          Reports for Comment #{selectedComment?.id || ""}
        </DialogHeader>
        <DialogBody className="max-h-[60vh] overflow-y-auto">
          {currentReports.length === 0 ? (
            <Typography>No reports for this comment</Typography>
          ) : (
            <div className="space-y-4">
              {currentReports.map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Typography variant="h6">
                        Reporter:{" "}
                        {report.User?.username ||
                          report.User?.email ||
                          "Anonymous"}
                      </Typography>
                      <Typography variant="small" className="mt-1">
                        Reason: {report.reason || "No reason provided"}
                      </Typography>
                      <Typography variant="small" className="mt-1">
                        Status:{" "}
                        <Chip
                          value={report.status || "pending"}
                          size="sm"
                          color={
                            report.status === "pending"
                              ? "amber"
                              : report.status === "resolved"
                              ? "green"
                              : "blue"
                          }
                        />
                      </Typography>
                    </div>
                    <Typography variant="small">
                      {new Date(report.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                  {report.moderatorNotes && (
                    <div className="mt-2 p-2 bg-blue-gray-50 rounded">
                      <Typography variant="small" className="font-bold">
                        Moderator Notes:
                      </Typography>
                      <Typography variant="small">
                        {report.moderatorNotes}
                      </Typography>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={() => setOpenReportsDialog(false)}
            className="mr-1"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default CommentAndReport;
