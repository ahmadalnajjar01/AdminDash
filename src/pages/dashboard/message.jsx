import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { EnvelopeIcon, PhoneIcon, UserIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Handle reply submission
  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/messages/${selectedMessage.id}/reply`,
        {
          replyContent,
        }
      );

      // Close dialog and reset
      setOpenDialog(false);
      setReplyContent("");
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h5">Loading messages...</Typography>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h2" className="mb-6">
        Contact Messages
      </Typography>

      {messages.length === 0 ? (
        <Typography variant="paragraph">No messages found</Typography>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader
                floated={false}
                shadow={false}
                className="bg-blue-50 p-4"
              >
                <div className="flex justify-between items-center">
                  <Typography variant="h5" color="blue-gray">
                    {message.subject}
                  </Typography>
                  <Chip
                    value={new Date(message.createdAt).toLocaleDateString()}
                    className="bg-blue-500 text-white"
                  />
                </div>
              </CardHeader>

              <CardBody>
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="h-5 w-5 text-blue-500" />
                  <Typography>{message.name}</Typography>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                  <Typography>{message.email}</Typography>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <PhoneIcon className="h-5 w-5 text-blue-500" />
                  <Typography>
                    {message.phoneNumber || "Not provided"}
                  </Typography>
                </div>
                <Typography className="mt-4">{message.message}</Typography>
              </CardBody>

              <CardFooter className="pt-0">
                <Button
                  color="blue"
                  onClick={() => {
                    setSelectedMessage(message);
                    setOpenDialog(true);
                  }}
                >
                  Reply
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
        <DialogHeader>Reply to {selectedMessage?.name}</DialogHeader>
        <DialogBody divider>
          <div className="mb-4">
            <Input label="To" value={selectedMessage?.email || ""} disabled />
          </div>
          <div className="mb-4">
            <Input
              label="Subject"
              value={`Re: ${selectedMessage?.subject || ""}`}
              disabled
            />
          </div>
          <Textarea
            label="Your Reply"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={6}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setOpenDialog(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="blue" onClick={handleReply}>
            Send Reply
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MessagesPage;
