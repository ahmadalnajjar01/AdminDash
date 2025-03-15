import React from "react";

const addProducts = () => {
  return (
    <div>
      <h2>Add Products</h2>
      <form>
        <label>
          Product Name:
          <input type="text" name="productName" />
        </label>
        <label>
          Price:
          <input type="number" name="price" />
        </label>
        <label>
          Description:
          <textarea name="description" rows="4" cols="50" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default addProducts;
