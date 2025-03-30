import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Avatar,
  Spinner,
  Alert,
  Switch,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    status: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/getAllProducts"
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to fetch products");
        setProducts(data.products);
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products-delete/${productId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter((product) => product.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status === "active",
      image: product.image,
    });
    setImagePreview(product.image);
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle status toggle
  const handleStatusToggle = () => {
    setEditFormData({
      ...editFormData,
      status: !editFormData.status,
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData({
        ...editFormData,
        image: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (productId) => {
    try {
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("description", editFormData.description);
      formData.append("price", editFormData.price);
      formData.append("stock", editFormData.stock);
      formData.append("status", editFormData.status ? "active" : "inactive");

      if (editFormData.image instanceof File) {
        formData.append("image", editFormData.image);
      }

      const response = await fetch(
        `http://localhost:5000/api/update-products/${productId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update product");

      setProducts(
        products.map((product) =>
          product.id === productId ? data.product : product
        )
      );
      setEditingProduct(null);
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // View product details
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        color="red"
        className="my-4"
      >
        {error}
      </Alert>
    );
  }

  return (
    <div className="p-4">
      <Card className="mb-8">
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Products Management
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "Product",
                  "Description",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const className = `py-3 px-5 border-b border-blue-gray-50`;

                return (
                  <tr key={product.id}>
                    <td className={className}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={`http://localhost:5000/${product.image}`}
                          alt={product.name}
                          size="sm"
                          variant="rounded"
                        />
                        <div>
                          <Typography variant="small" className="font-medium">
                            {product.name}
                          </Typography>
                          <Typography
                            variant="small"
                            className="text-blue-gray-500"
                          >
                            ID: #{product.id}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        className="font-medium text-blue-gray-600"
                      >
                        {product.description.substring(0, 50)}...
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        className="font-medium text-blue-gray-600"
                      >
                        ${product.price}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography
                        variant="small"
                        className="font-medium text-blue-gray-600"
                      >
                        {product.stock}
                      </Typography>
                    </td>
                    <td className={className}>
                      {editingProduct === product.id ? (
                        <Switch
                          color="green"
                          checked={editFormData.status}
                          onChange={handleStatusToggle}
                          label={
                            <div>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                {editFormData.status ? "Active" : "Inactive"}
                              </Typography>
                            </div>
                          }
                        />
                      ) : (
                        <Switch
                          color="green"
                          checked={product.status === "active"}
                          readOnly
                          label={
                            <div>
                              <Typography
                                color="blue-gray"
                                className="font-medium"
                              >
                                {product.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </Typography>
                            </div>
                          }
                        />
                      )}
                    </td>
                    <td className={className}>
                      <div className="flex gap-2">
                        <Tooltip content="View Details">
                          <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => viewProductDetails(product)}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </IconButton>
                        </Tooltip>
                        {editingProduct === product.id ? (
                          <>
                            <Tooltip content="Save">
                              <IconButton
                                variant="text"
                                color="green"
                                onClick={() => handleEditSubmit(product.id)}
                              >
                                <CheckIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Cancel">
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={handleCancelEdit}
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip content="Edit">
                              <IconButton
                                variant="text"
                                color="blue-gray"
                                onClick={() => handleEditClick(product)}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete">
                              <IconButton
                                variant="text"
                                color="red"
                                onClick={() => handleDelete(product.id)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Product Details Dialog */}
      <Dialog open={openDialog} handler={() => setOpenDialog(false)} size="lg">
        <DialogHeader>Product Details #{selectedProduct?.id}</DialogHeader>
        <DialogBody divider>
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Avatar
                    src={`http://localhost:5000/${selectedProduct.image}`}
                    alt={selectedProduct.name}
                    size="xxl"
                    variant="rounded"
                  />
                </div>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  {selectedProduct.name}
                </Typography>
                <Typography className="mb-4">
                  {selectedProduct.description}
                </Typography>
              </div>
              <div>
                <div className="space-y-4">
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold"
                    >
                      Price
                    </Typography>
                    <Typography>${selectedProduct.price}</Typography>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold"
                    >
                      Stock
                    </Typography>
                    <Typography>{selectedProduct.stock}</Typography>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold"
                    >
                      Status
                    </Typography>
                    <Switch
                      color="green"
                      checked={selectedProduct.status === "active"}
                      readOnly
                      label={
                        <Typography color="blue-gray" className="font-medium">
                          {selectedProduct.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </Typography>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setOpenDialog(false)}
            className="mr-1"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Form Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} handler={handleCancelEdit} size="xl">
          <DialogHeader>Edit Product #{editingProduct}</DialogHeader>
          <DialogBody divider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Typography variant="small" className="mb-2">
                    Product Image
                  </Typography>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={
                        imagePreview?.startsWith("blob:")
                          ? imagePreview
                          : `http://localhost:5000/${imagePreview}`
                      }
                      alt="Product"
                      size="xxl"
                      variant="rounded"
                    />
                    <label className="cursor-pointer">
                      <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        Upload New Image
                      </Button>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                  />
                  <Textarea
                    label="Description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Price"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                    />
                    <Input
                      type="number"
                      label="Stock"
                      name="stock"
                      value={editFormData.stock}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <Switch
                    color="green"
                    checked={editFormData.status}
                    onChange={handleStatusToggle}
                    label={
                      <Typography color="blue-gray" className="font-medium">
                        {editFormData.status ? "Active" : "Inactive"}
                      </Typography>
                    }
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCancelEdit}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="green"
              onClick={() => handleEditSubmit(editingProduct)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default Products;
