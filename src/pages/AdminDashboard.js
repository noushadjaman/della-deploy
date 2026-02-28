import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col, Tabs, Tab, Modal, Table, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AdminDashboard = () => {
  // Product Refs
  const nameRef = useRef();
  const categoryRef = useRef();
  const priceRef = useRef();
  const discountRef = useRef();
  const stockRef = useRef();
  const descriptionRef = useRef();
  const returnPolicyRef = useRef();

  // Banner Refs
  const bannerTitleRef = useRef();
  const bannerDescRef = useRef();
  const bannerLinkRef = useRef();

  // Category Refs
  const categoryNameRef = useRef();

  // Brand Refs
  const brandNameRef = useRef();
  const brandInfoRef = useRef();

  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // File States
  const [productImages, setProductImages] = useState([null, null, null]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isDailyDeal, setIsDailyDeal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sizes, setSizes] = useState({});
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [brandImageFile, setBrandImageFile] = useState(null);

  // Data States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [editProductImages, setEditProductImages] = useState([null, null, null]);
  const [editMainImageIndex, setEditMainImageIndex] = useState(0);
  const [editImageFile, setEditImageFile] = useState(null);

  const navigate = useNavigate();

  // Cloudinary Config
  const CLOUD_NAME = "drht98uvm";
  const UPLOAD_PRESET = "della_uploads";

  // Protect the route and fetch data
  useEffect(() => {
    if (!currentUser || currentUser.email !== 'admin@admin.della') {
      navigate('/');
      return;
    }

    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchBanners = async () => {
      try {
        const q = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(items);
      } catch (err) {
        console.error("Error fetching banners:", err);
      }
    };

    const fetchBrands = async () => {
      try {
        const q = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrands(items);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(items);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    const fetchWallet = async () => {
      try {
        const q = query(collection(db, 'wallet'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const balance = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        setWallet({ balance, transactions: items });
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    };

    fetchCategories();
    fetchProducts();
    fetchBanners();
    fetchBrands();
    fetchOrders();
    fetchWallet();
  }, [currentUser, navigate]);

  // Helper for Cloudinary Upload
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const productBrandRef = useRef();

  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    if (!val) {
      setSizes({});
      return;
    }
    const lower = val.toLowerCase();
    if (lower.includes('mens') || lower.includes('womens') || lower.includes('fashion')) {
      // clothing sizes
      const newSizes = {};
      clothingSizes.forEach(s => newSizes[s] = sizes[s] || 0);
      setSizes(newSizes);
    } else if (lower.includes('shoe') || lower.includes('shoes')) {
      const newSizes = {};
      shoeSizes.forEach(s => newSizes[s] = sizes[s] || 0);
      setSizes(newSizes);
    } else {
      setSizes({});
    }
  };

  const handleEditCategoryChange = (val) => {
    // update category in editFields and initialize sizes if needed
    setEditFields(prev => ({ ...prev, category: val }));
    if (!val) {
      setEditFields(prev => ({ ...prev, sizes: {} }));
      return;
    }
    const lower = val.toLowerCase();
    if (lower.includes('mens') || lower.includes('womens') || lower.includes('fashion')) {
      const newSizes = {};
      clothingSizes.forEach(s => newSizes[s] = (editFields.sizes && editFields.sizes[s]) || 0);
      setEditFields(prev => ({ ...prev, sizes: newSizes }));
    } else if (lower.includes('shoe') || lower.includes('shoes')) {
      const newSizes = {};
      shoeSizes.forEach(s => newSizes[s] = (editFields.sizes && editFields.sizes[s]) || 0);
      setEditFields(prev => ({ ...prev, sizes: newSizes }));
    } else {
      setEditFields(prev => ({ ...prev, sizes: {} }));
    }
  };

  // Manage-products sizes quick-edit modal state
  const [showSizesModal, setShowSizesModal] = useState(false);
  const [sizesModalProduct, setSizesModalProduct] = useState(null);
  const [sizesModalSizes, setSizesModalSizes] = useState({});

  const openSizesModal = (product) => {
    // initialize sizes: prefer existing, otherwise infer from category
    let initial = {};
    if (product?.sizes && Object.keys(product.sizes).length) {
      initial = { ...product.sizes };
    } else if (product?.category) {
      const lower = product.category.toLowerCase();
      if (lower.includes('mens') || lower.includes('womens') || lower.includes('fashion')) {
        clothingSizes.forEach(s => initial[s] = 0);
      } else if (lower.includes('shoe') || lower.includes('shoes')) {
        shoeSizes.forEach(s => initial[s] = 0);
      }
    }
    setSizesModalProduct(product);
    setSizesModalSizes(initial);
    setShowSizesModal(true);
  };

  const saveSizesModal = async () => {
    if (!sizesModalProduct) return;
    try {
      setLoading(true);
      const sum = Object.values(sizesModalSizes).reduce((a, b) => a + Number(b || 0), 0);
      await updateDoc(doc(db, 'products', sizesModalProduct.id), {
        sizes: sizesModalSizes,
        stock: sum,
        updatedAt: serverTimestamp()
      });
      setProducts(prev => prev.map(p => p.id === sizesModalProduct.id ? { ...p, sizes: sizesModalSizes, stock: sum } : p));
      setShowSizesModal(false);
      setSizesModalProduct(null);
    } catch (err) {
      console.error('Failed to save sizes:', err);
      setError('Failed to save sizes.');
    } finally {
      setLoading(false);
    }
  };

  async function handleProductSubmit(e) {
    e.preventDefault();
    if (currentUser?.email !== 'admin@admin.della') return setError('Access Denied');

    // At least one image must be selected
    const selectedFiles = productImages.filter(f => f !== null);
    if (selectedFiles.length === 0) return setError('Please select at least one image for the product.');
    if (productImages[mainImageIndex] === null) return setError('The selected Home photo must have a file.');

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      // Upload all selected images
      const uploadPromises = productImages.map(async (file) => {
        if (!file) return null;
        return await uploadToCloudinary(file);
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Determine the main imageUrl based on the mainImageIndex
      // We need to map the mainImageIndex back to the validImageUrls array
      // or just store the full array and an index. 
      // Storing full array [url1, url2, url3] where nulls are empty strings is easier.
      const finalImageUrls = imageUrls.map(url => url || "");

      // compute stock from sizes when provided
      const sizeSum = Object.keys(sizes || {}).length ? Object.values(sizes).reduce((a, b) => a + Number(b || 0), 0) : 0;

      await addDoc(collection(db, 'products'), {
        name: nameRef.current.value,
        category: selectedCategory || (categoryRef.current && categoryRef.current.value),
        brand: productBrandRef.current.value || 'Others',
        price: parseFloat(priceRef.current.value),
        discount: parseFloat(discountRef.current.value) || 0,
        stock: sizeSum || parseInt(stockRef.current.value),
        sizes: Object.keys(sizes || {}).length ? sizes : {},
        description: descriptionRef.current.value,
        returnPolicy: returnPolicyRef.current.value || '7 Days Return Policy',
        imageUrls: finalImageUrls,
        mainImageIndex: mainImageIndex,
        imageUrl: finalImageUrls[mainImageIndex], // Keep for backward compatibility
        isFlashSale: isFlashSale,
        isDailyDeal: isDailyDeal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.email
      });

      setSuccess('Product added successfully!');
      e.target.reset();
      setProductImages([null, null, null]);
      setMainImageIndex(0);
      setIsFlashSale(false);
      setIsDailyDeal(false);
      setSelectedCategory('');
      setSizes({});
    } catch (err) {
      console.error("Error adding product: ", err);
      setError('Failed to add product. ' + err.message);
    }
    setLoading(false);
  }

  async function handleBrandSubmit(e) {
    e.preventDefault();
    if (currentUser?.email !== 'admin@admin.della') return setError('Access Denied');
    if (!brandImageFile) return setError('Please select a logo for the brand.');

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const imageUrl = await uploadToCloudinary(brandImageFile);

      const docRef = await addDoc(collection(db, 'brands'), {
        name: brandNameRef.current.value,
        info: brandInfoRef.current.value || '',
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        createdBy: currentUser.email
      });

      setBrands(prev => [{ id: docRef.id, name: brandNameRef.current.value, info: brandInfoRef.current.value, imageUrl }, ...prev]);

      setSuccess('Brand added successfully!');
      e.target.reset();
      setBrandImageFile(null);
    } catch (err) {
      console.error("Error adding brand: ", err);
      setError('Failed to add brand. ' + err.message);
    }
    setLoading(false);
  }

  async function handleBannerSubmit(e) {
    e.preventDefault();
    if (currentUser?.email !== 'admin@admin.della') return setError('Access Denied');
    if (!bannerImageFile) return setError('Please select an image for the banner.');

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const imageUrl = await uploadToCloudinary(bannerImageFile);

      await addDoc(collection(db, 'banners'), {
        title: bannerTitleRef.current.value || '', // Optional
        description: bannerDescRef.current.value || '', // Optional
        link: bannerLinkRef.current.value,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        createdBy: currentUser.email
      });

      setSuccess('Banner added successfully!');
      e.target.reset();
      setBannerImageFile(null);
    } catch (err) {
      console.error("Error adding banner: ", err);
      setError('Failed to add banner. ' + err.message);
    }
    setLoading(false);
  }

  async function handleCategorySubmit(e) {
    e.preventDefault();
    if (currentUser?.email !== 'admin@admin.della') return setError('Access Denied');
    if (!categoryImageFile) return setError('Please select an image for the category.');

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const imageUrl = await uploadToCloudinary(categoryImageFile);

      const docRef = await addDoc(collection(db, 'categories'), {
        name: categoryNameRef.current.value,
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        createdBy: currentUser.email
      });

      // Update local state immediately
      setCategories(prev => [{ id: docRef.id, name: categoryNameRef.current.value, imageUrl }, ...prev]);

      setSuccess('Category added successfully!');
      e.target.reset();
      setCategoryImageFile(null);
    } catch (err) {
      console.error("Error adding category: ", err);
      setError('Failed to add category. ' + err.message);
    }
    setLoading(false);
  }

  const openEditProduct = (p) => {
    setEditingProduct(p);
    setEditFields({
      name: p.name || '',
      price: p.price || 0,
      discount: p.discount || 0,
      stock: p.stock || 0,
      category: p.category || '',
      brand: p.brand || 'Others',
      description: p.description || '',
      returnPolicy: p.returnPolicy || '7 Days Return Policy',
      imageUrls: p.imageUrls || [p.imageUrl || "", "", ""],
      isFlashSale: p.isFlashSale || false,
      isDailyDeal: p.isDailyDeal || false,
      sizes: p.sizes || {}
    });
    setEditMainImageIndex(p.mainImageIndex || 0);
    setEditProductImages([null, null, null]);
  };
  const saveProduct = async () => {
    try {
      setLoading(true);

      // Handle image updates
      const updatedImageUrls = [...(editFields.imageUrls || ["", "", ""])];

      const uploadPromises = editProductImages.map(async (file, index) => {
        if (file) {
          const url = await uploadToCloudinary(file);
          updatedImageUrls[index] = url;
        }
      });

      await Promise.all(uploadPromises);

      // Validate that the main image exists (either old or new)
      if (!updatedImageUrls[editMainImageIndex]) {
        throw new Error("The selected Home photo must have an image.");
      }

      // if sizes provided, compute total stock from sizes
      const editSizeSum = editFields.sizes && Object.keys(editFields.sizes).length ? Object.values(editFields.sizes).reduce((a, b) => a + Number(b || 0), 0) : 0;

      await updateDoc(doc(db, 'products', editingProduct.id), {
        name: editFields.name,
        price: parseFloat(editFields.price),
        discount: parseFloat(editFields.discount) || 0,
        stock: editSizeSum || parseInt(editFields.stock),
        category: editFields.category,
        brand: editFields.brand || 'Others',
        description: editFields.description,
        returnPolicy: editFields.returnPolicy || '7 Days Return Policy',
        imageUrls: updatedImageUrls,
        mainImageIndex: editMainImageIndex,
        imageUrl: updatedImageUrls[editMainImageIndex],
        isFlashSale: editFields.isFlashSale,
        isDailyDeal: editFields.isDailyDeal,
        sizes: editFields.sizes || {},
        updatedAt: serverTimestamp()
      });

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...editFields,
        imageUrls: updatedImageUrls,
        mainImageIndex: editMainImageIndex,
        imageUrl: updatedImageUrls[editMainImageIndex]
      } : p));

      setEditingProduct(null);
      setSuccess('Product updated');
    } catch (err) {
      setError('Failed to update product. ' + err.message);
    }
    setLoading(false);
  };

  const openEditBrand = (b) => {
    setEditingBrand(b);
    setEditFields({ name: b.name || '', info: b.info || '' });
    setEditImageFile(null);
  };
  const saveBrand = async () => {
    try {
      setLoading(true);
      let updateData = { name: editFields.name, info: editFields.info };
      if (editImageFile) {
        const imageUrl = await uploadToCloudinary(editImageFile);
        updateData.imageUrl = imageUrl;
      }
      await updateDoc(doc(db, 'brands', editingBrand.id), updateData);
      setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...updateData } : b));
      setEditingBrand(null);
      setSuccess('Brand updated');
    } catch (err) {
      setError('Failed to update brand. ' + err.message);
    }
    setLoading(false);
  };

  const openEditBanner = (b) => {
    setEditingBanner(b);
    setEditFields({ title: b.title || '', description: b.description || '', link: b.link || '' });
    setEditImageFile(null);
  };
  const saveBanner = async () => {
    try {
      setLoading(true);
      let imageUrl = editingBanner.imageUrl;
      if (editImageFile) {
        imageUrl = await uploadToCloudinary(editImageFile);
      }
      await updateDoc(doc(db, 'banners', editingBanner.id), {
        title: editFields.title,
        description: editFields.description,
        link: editFields.link,
        imageUrl
      });
      setBanners(prev => prev.map(x => x.id === editingBanner.id ? { ...x, ...editFields, imageUrl } : x));
      setEditingBanner(null);
      setSuccess('Banner updated');
    } catch (err) {
      setError('Failed to update banner. ' + err.message);
    }
    setLoading(false);
  };

  const openEditCategory = (c) => {
    setEditingCategory(c);
    setEditFields({ name: c.name || '' });
    setEditImageFile(null);
  };
  const saveCategory = async () => {
    try {
      setLoading(true);
      let updateData = { name: editFields.name };
      if (editImageFile) {
        const imageUrl = await uploadToCloudinary(editImageFile);
        updateData.imageUrl = imageUrl;
      }
      await updateDoc(doc(db, 'categories', editingCategory.id), updateData);
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updateData } : c));
      setEditingCategory(null);
      setSuccess('Category updated');
    } catch (err) {
      setError('Failed to update category. ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (collectionName, id, updater) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, collectionName, id));
      updater(prev => prev.filter(x => x.id !== id));
      setSuccess('Deleted');
    } catch (err) {
      setError('Delete failed. ' + err.message);
    }
    setLoading(false);
  };

  // Order Status Management
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const orderRef = doc(db, 'orders', orderId);
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

      // Handle wallet transactions for delivered orders
      if (newStatus === 'delivered') {
        // Add product cost to wallet
        const productCost = order.subtotal;
        const walletTransaction = {
          orderId: orderId,
          amount: productCost,
          description: `Payment received for order #${orderId.substring(0, 8)}`,
          type: 'credit',
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, 'wallet'), walletTransaction);

        // Update wallet balance
        const newBalance = wallet.balance + productCost;
        setWallet(prev => ({
          balance: newBalance,
          transactions: [walletTransaction, ...prev.transactions]
        }));

        setSuccess(`Order delivered! ৳ ${productCost} added to wallet.`);
      } else if (newStatus === 'cancelled') {
        // Handle cancellation - no wallet update needed for pending orders
        setSuccess('Order cancelled successfully.');
      } else {
        setSuccess(`Order status updated to ${newStatus}.`);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. ' + err.message);
    }
    setLoading(false);
  };

  // Customer Details View
  const viewCustomerDetails = (order) => {
    // Logic for viewing customer details can be added here if needed
  };

  // PDF Memo Generation
  const generateMemoPDF = async (order) => {
    try {
      setLoading(true);

      // Create a hidden div for PDF generation
      const memoDiv = document.createElement('div');
      memoDiv.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 210mm;
        padding: 20mm;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
      `;

      // Generate memo HTML content
      const memoHTML = `
        <div style="border: 2px solid #d4af37; padding: 20px; border-radius: 10px; background: #fff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4af37; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">DELLA</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Premium Footwear Collection</p>
            <hr style="border: none; border-top: 2px solid #d4af37; width: 50%; margin: 10px auto;">
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="margin: 0 0 10px 0; color: #333;">Customer Details</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${order.fullName || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${order.address || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${order.city || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Postal Code:</strong> ${order.postalCode || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Order Information</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id.substring(0, 8)}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${order.status === 'delivered' ? '#28a745' : order.status === 'shipped' ? '#17a2b8' : order.status === 'pending' ? '#ffc107' : '#dc3545'}">${order.status.toUpperCase()}</span></p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa; border-bottom: 2px solid #d4af37;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Size</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Unit Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px;">${item.name}</td>
                  <td style="padding: 10px; text-align: center;">${item.size || '-'}</td>
                  <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right;">৳ ${item.price}</td>
                  <td style="padding: 10px; text-align: right;">৳ ${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="border-top: 2px solid #d4af37; padding-top: 20px; display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0 0 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
              <p style="margin: 0;"><strong>Delivery Method:</strong> ${order.deliveryMethod || 'Standard Delivery'}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 5px 0;"><strong>Subtotal:</strong> ৳ ${order.subtotal}</p>
              <p style="margin: 0 0 5px 0;"><strong>Delivery Fee:</strong> ৳ ${order.deliveryFee || 0}</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #d4af37;">Total: ৳ ${order.total}</p>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #ddd; font-size: 11px; color: #666;">
            <p style="margin: 0 0 5px 0;"><strong>Return Policy:</strong> ${order.returnPolicy || '7 Days Return Policy'}</p>
            <p style="margin: 0;"><strong>Terms:</strong> Please keep this memo for your records. Contact us for any queries.</p>
          </div>
        </div>
      `;

      memoDiv.innerHTML = memoHTML;
      document.body.appendChild(memoDiv);

      // Generate PDF
      const canvas = await html2canvas(memoDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = canvas.height * pdfWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DELLA_Order_${order.id.substring(0, 8)}.pdf`);

      // Clean up
      document.body.removeChild(memoDiv);
      setSuccess('Memo PDF generated successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF memo. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.email !== 'admin@admin.della') {
    return null;
  }

  return (
    <Container fluid className="py-4 bg-light min-vh-100">
      <div className="max-width-container mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">Admin <span className="text-primary">Dashboard</span></h2>
          <Button variant="outline-dark" onClick={() => navigate('/')} size="sm">
            <i className="fas fa-home me-2"></i> Back to Site
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            <Tabs defaultActiveKey="product" id="admin-dashboard-tabs" className="custom-admin-tabs px-3 pt-2 bg-white border-bottom">
              {/* Product Management */}
              <Tab eventKey="product" title={<span><i className="fas fa-box me-2"></i>Products</span>}>
                <div className="p-4">
                  <Row className="g-4">
                    <Col lg={5}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm">
                        <h5 className="fw-bold mb-4">Add New Product</h5>
                        <Form onSubmit={handleProductSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Product Name</Form.Label>
                            <Form.Control type="text" ref={nameRef} placeholder="Enter name" required />
                          </Form.Group>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Category</Form.Label>
                                <Form.Select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} required>
                                  <option value="">Select Category...</option>
                                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Brand</Form.Label>
                                <Form.Select ref={productBrandRef}>
                                  <option value="Others">Others</option>
                                  {brands.map(brand => <option key={brand.id} value={brand.name}>{brand.name}</option>)}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Price (<strong>৳</strong>)</Form.Label>
                                <Form.Control type="number" step="0.01" ref={priceRef} required />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Discount (%)</Form.Label>
                                <Form.Control type="number" step="0.01" min="0" max="100" ref={discountRef} placeholder="0" />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">Stock</Form.Label>
                                <Form.Control type="number" ref={stockRef} required />
                              </Form.Group>
                            </Col>
                          </Row>

                          {Object.keys(sizes || {}).length > 0 && (
                            <div className="mb-3">
                              <Form.Label className="small fw-bold text-muted">Size Quantities</Form.Label>
                              <Row className="g-2">
                                {Object.keys(sizes).map((sizeKey) => (
                                  <Col key={sizeKey} xs={6} sm={4} md={3} lg={2}>
                                    <div className="d-flex flex-column">
                                      <small className="text-muted mb-1">{sizeKey}</small>
                                      <input type="number" min={0} className="form-control form-control-sm" value={sizes[sizeKey]} onChange={(e) => setSizes(prev => ({ ...prev, [sizeKey]: Math.max(0, parseInt(e.target.value || 0)) }))} />
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          )}

                          <Form.Label className="small fw-bold text-muted mb-2">Images (Max 3, select Home photo)</Form.Label>
                          <Row className="mb-3 g-2">
                            {[0, 1, 2].map((idx) => (
                              <Col key={idx} xs={4}>
                                <div className={`p-2 border rounded-3 text-center ${mainImageIndex === idx ? 'border-primary bg-light' : ''}`} style={{ fontSize: '0.7rem' }}>
                                  <input
                                    type="file"
                                    className="d-none"
                                    id={`file-${idx}`}
                                    onChange={(e) => {
                                      const newFiles = [...productImages];
                                      newFiles[idx] = e.target.files[0];
                                      setProductImages(newFiles);
                                    }}
                                  />
                                  <label htmlFor={`file-${idx}`} className="btn btn-sm btn-light w-100 mb-1 border">
                                    <i className="fas fa-upload"></i>
                                  </label>
                                  <div className="form-check form-check-inline m-0">
                                    <input className="form-check-input" type="radio" name="mainImg" checked={mainImageIndex === idx} onChange={() => setMainImageIndex(idx)} />
                                    <label className="form-check-label">Home</label>
                                  </div>
                                  {productImages[idx] && <div className="text-success text-truncate mt-1">{productImages[idx].name}</div>}
                                </div>
                              </Col>
                            ))}
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Description</Form.Label>
                            <Form.Control as="textarea" rows={2} ref={descriptionRef} required />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">Return Policy (e.g. 7 Days)</Form.Label>
                            <Form.Control type="text" ref={returnPolicyRef} placeholder="7 Days Return Policy" />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              label="Add to Flash Sale"
                              checked={isFlashSale}
                              onChange={(e) => setIsFlashSale(e.target.checked)}
                              className="fw-bold"
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Check
                              type="checkbox"
                              label="Add to Daily Deals"
                              checked={isDailyDeal}
                              onChange={(e) => setIsDailyDeal(e.target.checked)}
                              className="fw-bold"
                            />
                          </Form.Group>

                          <Button disabled={loading} className="w-100 rounded-pill py-2 fw-bold" type="submit">
                            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</> : 'Add Product'}
                          </Button>
                        </Form>
                      </div>
                    </Col>

                    <Col lg={7}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0">Manage Products</h5>
                          <div style={{ width: '200px' }}>
                            <Form.Control size="sm" placeholder="Search..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="rounded-pill" />
                          </div>
                        </div>
                        <div className="table-responsive">
                          <Table hover className="align-middle border-top-0">
                            <thead className="bg-light">
                              <tr className="small text-muted text-uppercase">
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody className="small">
                              {products.filter(p => p.name?.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                <tr key={p.id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <img src={p.imageUrl} alt="" className="rounded-3 me-2" style={{ width: 35, height: 35, objectFit: 'cover' }} />
                                      <div className="fw-bold text-truncate" style={{ maxWidth: 120 }}>{p.name}</div>
                                    </div>
                                  </td>
                                  <td><span className="badge bg-light text-dark border">{p.category}</span></td>
                                  <td><strong>৳</strong>{p.price}</td>
                                  <td>{p.stock}</td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button size="sm" variant="light" className="rounded-circle" onClick={() => openSizesModal(p)} title="Edit Sizes"><i className="fas fa-list text-secondary"></i></Button>
                                      <Button size="sm" variant="light" className="rounded-circle" onClick={() => openEditProduct(p)}><i className="fas fa-edit text-primary"></i></Button>
                                      <Button size="sm" variant="light" className="rounded-circle" onClick={() => handleDelete('products', p.id, setProducts)}><i className="fas fa-trash text-danger"></i></Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* Brand Management */}
              <Tab eventKey="brand" title={<span><i className="fas fa-tags me-2"></i>Brands</span>}>
                <div className="p-4">
                  <Row className="g-4">
                    <Col lg={5}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm">
                        <h5 className="fw-bold mb-4">Add New Brand</h5>
                        <Form onSubmit={handleBrandSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Brand Name</Form.Label>
                            <Form.Control type="text" ref={brandNameRef} required />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Brand Info (Optional)</Form.Label>
                            <Form.Control type="text" ref={brandInfoRef} placeholder="e.g. Premium Footwear" />
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">Brand Logo</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={(e) => setBrandImageFile(e.target.files[0])} required />
                          </Form.Group>
                          <Button disabled={loading} className="w-100 rounded-pill py-2 fw-bold" type="submit">
                            {loading ? 'Adding...' : 'Add Brand'}
                          </Button>
                        </Form>
                      </div>
                    </Col>
                    <Col lg={7}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <h5 className="fw-bold mb-4">Manage Brands</h5>
                        <Table hover className="align-middle">
                          <thead className="bg-light">
                            <tr className="small text-muted">
                              <th>Logo</th>
                              <th>Name</th>
                              <th>Info</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody className="small">
                            {brands.map(b => (
                              <tr key={b.id}>
                                <td><img src={b.imageUrl} alt="" className="rounded-circle shadow-sm border" style={{ width: 60, height: 60, objectFit: 'cover', background: 'white' }} /></td>
                                <td className="fw-bold">{b.name}</td>
                                <td>{b.info || '-'}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => openEditBrand(b)}><i className="fas fa-edit text-primary"></i></Button>
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => handleDelete('brands', b.id, setBrands)}><i className="fas fa-trash text-danger"></i></Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* Banner Management */}
              <Tab eventKey="banner" title={<span><i className="fas fa-image me-2"></i>Banners</span>}>
                <div className="p-4">
                  <Row className="g-4">
                    <Col lg={5}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm">
                        <h5 className="fw-bold mb-4">Add New Banner</h5>
                        <Form onSubmit={handleBannerSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Title (Optional)</Form.Label>
                            <Form.Control type="text" ref={bannerTitleRef} />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Link / Category</Form.Label>
                            <Form.Select ref={bannerLinkRef} required>
                              <option value="">Select Redirect Category...</option>
                              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">Banner Image</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={(e) => setBannerImageFile(e.target.files[0])} required />
                          </Form.Group>
                          <Button disabled={loading} className="w-100 rounded-pill py-2 fw-bold" type="submit">
                            {loading ? 'Adding...' : 'Add Banner'}
                          </Button>
                        </Form>
                      </div>
                    </Col>
                    <Col lg={7}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <h5 className="fw-bold mb-4">Manage Banners</h5>
                        <Table hover className="align-middle">
                          <thead className="bg-light">
                            <tr className="small text-muted">
                              <th>Image</th>
                              <th>Title</th>
                              <th>Link</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody className="small">
                            {banners.map(b => (
                              <tr key={b.id}>
                                <td><img src={b.imageUrl} alt="" className="rounded-3" style={{ width: 80, height: 40, objectFit: 'cover' }} /></td>
                                <td className="fw-bold">{b.title || '-'}</td>
                                <td>{b.link}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => openEditBanner(b)}><i className="fas fa-edit text-primary"></i></Button>
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => handleDelete('banners', b.id, setBanners)}><i className="fas fa-trash text-danger"></i></Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* Category Management */}
              <Tab eventKey="category" title={<span><i className="fas fa-th-large me-2"></i>Categories</span>}>
                <div className="p-4">
                  <Row className="g-4">
                    <Col lg={5}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm">
                        <h5 className="fw-bold mb-4">Add New Category</h5>
                        <Form onSubmit={handleCategorySubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Category Name</Form.Label>
                            <Form.Control type="text" ref={categoryNameRef} required />
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">Category Image</Form.Label>
                            <Form.Control type="file" accept="image/*" onChange={(e) => setCategoryImageFile(e.target.files[0])} required />
                          </Form.Group>
                          <Button disabled={loading} className="w-100 rounded-pill py-2 fw-bold" type="submit">
                            {loading ? 'Adding...' : 'Add Category'}
                          </Button>
                        </Form>
                      </div>
                    </Col>
                    <Col lg={7}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <h5 className="fw-bold mb-4">Manage Categories</h5>
                        <Table hover className="align-middle">
                          <thead className="bg-light">
                            <tr className="small text-muted">
                              <th>Image</th>
                              <th>Name</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody className="small">
                            {categories.map(c => (
                              <tr key={c.id}>
                                <td><img src={c.imageUrl} alt="" className="rounded-3" style={{ width: 40, height: 40, objectFit: 'cover' }} /></td>
                                <td className="fw-bold">{c.name}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => openEditCategory(c)}><i className="fas fa-edit text-primary"></i></Button>
                                    <Button size="sm" variant="light" className="rounded-circle" onClick={() => handleDelete('categories', c.id, setCategories)}><i className="fas fa-trash text-danger"></i></Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* Orders Management */}
              <Tab eventKey="orders" title={<span><i className="fas fa-shopping-bag me-2"></i>Orders</span>}>
                <div className="p-4">
                  <Row className="g-4">
                    {/* Orders List */}
                    <Col lg={8}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0">Order Management</h5>
                          <div style={{ width: '250px' }}>
                            <Form.Control size="sm" placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="rounded-pill" />
                          </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="bg-light p-3 rounded mb-4">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">Wallet Balance</small>
                              <h4 className="fw-bold mb-0 text-primary">৳ {wallet.balance.toLocaleString()}</h4>
                            </div>
                            <div className="text-end">
                              <small className="text-muted">Total Transactions</small>
                              <h6 className="mb-0">{wallet.transactions.length}</h6>
                            </div>
                          </div>
                        </div>

                        <div className="table-responsive">
                          <Table hover className="align-middle border-top-0">
                            <thead className="bg-light">
                              <tr className="small text-muted text-uppercase">
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody className="small">
                              {orders.filter(order =>
                                order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                (order.fullName && order.fullName.toLowerCase().includes(orderSearch.toLowerCase())) ||
                                (order.phone && order.phone.includes(orderSearch))
                              ).map(order => (
                                <tr key={order.id}>
                                  <td>
                                    <div className="fw-bold text-primary">#{order.id.substring(0, 8)}</div>
                                  </td>
                                  <td>
                                    <div className="fw-bold">{order.fullName || 'N/A'}</div>
                                    <small className="text-muted">{order.phone}</small>
                                  </td>
                                  <td>
                                    <strong>৳ {order.total}</strong>
                                  </td>
                                  <td>
                                    <Badge
                                      bg={order.status === 'pending' ? 'warning' :
                                        order.status === 'shipped' ? 'info' :
                                          order.status === 'delivered' ? 'success' :
                                            order.status === 'cancelled' ? 'danger' : 'secondary'}
                                      className="px-3 py-2"
                                    >
                                      {order.status.toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td>
                                    <small className="text-muted">
                                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                    </small>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        onClick={() => viewCustomerDetails(order)}
                                        title="View Customer Details"
                                      >
                                        <i className="fas fa-user me-1"></i> Details
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => generateMemoPDF(order)}
                                        title="Download Memo PDF"
                                      >
                                        <i className="fas fa-file-pdf me-1"></i> PDF
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => handleOrderStatusChange(order.id, 'shipped')}
                                        disabled={order.status === 'cancelled' || order.status === 'delivered'}
                                      >
                                        Ship
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => handleOrderStatusChange(order.id, 'delivered')}
                                        disabled={order.status === 'cancelled' || order.status === 'pending'}
                                      >
                                        Delivered
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                                        disabled={order.status === 'delivered'}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    </Col>

                    {/* Wallet Transactions */}
                    <Col lg={4}>
                      <div className="p-4 border rounded-4 bg-white shadow-sm h-100">
                        <h5 className="fw-bold mb-4">Wallet Transactions</h5>
                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                          {wallet.transactions.length === 0 ? (
                            <div className="text-center text-muted py-4">
                              No transactions yet
                            </div>
                          ) : (
                            wallet.transactions.map((transaction, index) => (
                              <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                                <div>
                                  <div className="fw-bold">{transaction.description}</div>
                                  <small className="text-muted">
                                    {transaction.createdAt && typeof transaction.createdAt.toDate === 'function'
                                      ? transaction.createdAt.toDate().toLocaleDateString()
                                      : 'N/A'}
                                  </small>
                                </div>
                                <div className={`fw-bold ${transaction.amount > 0 ? 'text-success' : 'text-danger'}`}>
                                  {transaction.amount > 0 ? '+' : ''}৳ {transaction.amount}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>

      <Modal show={!!editingProduct} onHide={() => setEditingProduct(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control value={editFields.name || ''} onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" step="0.01" value={editFields.price || 0} onChange={(e) => setEditFields(prev => ({ ...prev, price: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" step="0.01" min="0" max="100" value={editFields.discount || 0} onChange={(e) => setEditFields(prev => ({ ...prev, discount: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type="number" value={editFields.stock || 0} onChange={(e) => setEditFields(prev => ({ ...prev, stock: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>

            {editFields.sizes && Object.keys(editFields.sizes).length > 0 && (
              <div className="mb-3">
                <Form.Label className="small fw-bold text-muted">Size Quantities</Form.Label>
                <Row className="g-2">
                  {Object.keys(editFields.sizes).map(sz => (
                    <Col key={sz} xs={6} sm={4} md={3} lg={2}>
                      <div className="d-flex flex-column">
                        <small className="text-muted mb-1">{sz}</small>
                        <input type="number" min={0} className="form-control form-control-sm" value={editFields.sizes[sz]} onChange={(e) => setEditFields(prev => ({ ...prev, sizes: { ...prev.sizes, [sz]: Math.max(0, parseInt(e.target.value || 0)) } }))} />
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} value={editFields.description || ''} onChange={(e) => setEditFields(prev => ({ ...prev, description: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Return Policy</Form.Label>
              <Form.Control value={editFields.returnPolicy || ''} onChange={(e) => setEditFields(prev => ({ ...prev, returnPolicy: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select value={editFields.category || ''} onChange={(e) => handleEditCategoryChange(e.target.value)}>
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Brand</Form.Label>
              <Form.Select value={editFields.brand || 'Others'} onChange={(e) => setEditFields(prev => ({ ...prev, brand: e.target.value }))}>
                <option value="Others">Others</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                label="Add to Flash Sale"
                checked={editFields.isFlashSale || false}
                onChange={(e) => setEditFields(prev => ({ ...prev, isFlashSale: e.target.checked }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Add to Daily Deals"
                checked={editFields.isDailyDeal || false}
                onChange={(e) => setEditFields(prev => ({ ...prev, isDailyDeal: e.target.checked }))}
              />
            </Form.Group>

            <Form.Label className="mb-2">Product Images (Replace existing or add new)</Form.Label>
            <Row className="mb-3">
              {[0, 1, 2].map((idx) => (
                <Col key={idx} md={4}>
                  <div className={`p-2 border rounded ${editMainImageIndex === idx ? 'border-primary bg-light' : ''}`}>
                    <div className="mb-2 text-center bg-white border rounded overflow-hidden" style={{ height: 60 }}>
                      {editFields.imageUrls?.[idx] ? (
                        <img src={editFields.imageUrls[idx]} alt="preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="text-muted" style={{ fontSize: 10, lineHeight: '60px' }}>No image</span>
                      )}
                    </div>
                    <Form.Group className="mb-2">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        size="sm"
                        onChange={(e) => {
                          const newFiles = [...editProductImages];
                          newFiles[idx] = e.target.files[0];
                          setEditProductImages(newFiles);
                        }}
                      />
                    </Form.Group>
                    <Form.Check
                      type="radio"
                      label="Home photo"
                      name="editMainImage"
                      checked={editMainImageIndex === idx}
                      onChange={() => setEditMainImageIndex(idx)}
                      id={`edit-main-img-${idx}`}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingProduct(null)}>Cancel</Button>
          <Button variant="primary" disabled={loading} onClick={saveProduct}>{loading ? 'Saving...' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editingBrand} onHide={() => setEditingBrand(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Brand</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Brand Name</Form.Label>
              <Form.Control value={editFields.name || ''} onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Brand Info</Form.Label>
              <Form.Control value={editFields.info || ''} onChange={(e) => setEditFields(prev => ({ ...prev, info: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>New Logo (optional)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0] || null)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingBrand(null)}>Cancel</Button>
          <Button variant="primary" disabled={loading} onClick={saveBrand}>{loading ? 'Saving...' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>

      {/* Sizes Quick-Edit Modal */}
      <Modal show={showSizesModal} onHide={() => setShowSizesModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Size Quantities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {sizesModalProduct && (
            <div>
              <h6 className="mb-3">{sizesModalProduct.name}</h6>
              {Object.keys(sizesModalSizes).length === 0 ? (
                <p className="text-muted">No sizes available for this product.</p>
              ) : (
                <Row className="g-2">
                  {Object.keys(sizesModalSizes).map(sz => (
                    <Col key={sz} xs={6} sm={4} md={3} lg={2}>
                      <div className="d-flex flex-column">
                        <small className="text-muted mb-1">{sz}</small>
                        <input type="number" min={0} className="form-control form-control-sm" value={sizesModalSizes[sz]} onChange={(e) => setSizesModalSizes(prev => ({ ...prev, [sz]: Math.max(0, parseInt(e.target.value || 0)) }))} />
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSizesModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveSizesModal} disabled={loading}>{loading ? 'Saving...' : 'Save Sizes'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editingBanner} onHide={() => setEditingBanner(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Banner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control value={editFields.title || ''} onChange={(e) => setEditFields(prev => ({ ...prev, title: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={editFields.description || ''} onChange={(e) => setEditFields(prev => ({ ...prev, description: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Link</Form.Label>
              <Form.Control value={editFields.link || ''} onChange={(e) => setEditFields(prev => ({ ...prev, link: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>New Image (optional)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0] || null)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingBanner(null)}>Cancel</Button>
          <Button variant="primary" disabled={loading} onClick={saveBanner}>{loading ? 'Saving...' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editingCategory} onHide={() => setEditingCategory(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Name</Form.Label>
            <Form.Control value={editFields.name || ''} onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>New Image (optional)</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => setEditImageFile(e.target.files[0] || null)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button>
          <Button variant="primary" disabled={loading} onClick={saveCategory}>{loading ? 'Saving...' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
