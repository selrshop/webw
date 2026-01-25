import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/utils/api';

const PRODUCT_TYPES = [
  { value: 'general', label: 'General', hasVeg: false, hasSizes: false, hasColors: false },
  { value: 'food', label: 'Food & Beverages', hasVeg: true, hasSizes: false, hasColors: false },
  { value: 'clothing', label: 'Clothing & Apparel', hasVeg: false, hasSizes: true, hasColors: true },
  { value: 'grocery', label: 'Grocery', hasVeg: true, hasSizes: false, hasColors: false },
  { value: 'electronics', label: 'Electronics', hasVeg: false, hasSizes: false, hasColors: true },
  { value: 'service', label: 'Service', hasVeg: false, hasSizes: false, hasColors: false },
  { value: 'medicine', label: 'Medicine', hasVeg: false, hasSizes: false, hasColors: false },
  { value: 'cosmetics', label: 'Cosmetics', hasVeg: false, hasSizes: true, hasColors: true },
  { value: 'hardware', label: 'Hardware', hasVeg: false, hasSizes: true, hasColors: true },
  { value: 'other', label: 'Other', hasVeg: false, hasSizes: false, hasColors: false }
];

const SIZES_PRESETS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  cosmetics: ['Small', 'Medium', 'Large'],
  hardware: ['Small', 'Medium', 'Large']
};

const COLOR_PRESETS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey'];

const ProductsPageEnhanced = () => {
  const { businessId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mrp: '',
    sale_price: '',
    image_url: '',
    category: '',
    product_type: 'general',
    bulk_pricing: [],
    is_available: true,
    is_veg: null,
    sizes: [],
    colors: [],
    stock_quantity: ''
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/businesses/${businessId}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (mrp, salePrice) => {
    if (mrp > 0 && salePrice < mrp) {
      return Math.round(((mrp - salePrice) / mrp) * 100);
    }
    return 0;
  };

  const getProductTypeConfig = (type) => {
    return PRODUCT_TYPES.find(pt => pt.value === type) || PRODUCT_TYPES[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      mrp: parseFloat(formData.mrp),
      sale_price: parseFloat(formData.sale_price),
      stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
      bulk_pricing: formData.bulk_pricing.map(bp => ({
        min_quantity: parseInt(bp.min_quantity),
        price_per_unit: parseFloat(bp.price_per_unit)
      }))
    };
    
    try {
      if (editingProduct) {
        await api.put(`/businesses/${businessId}/products/${editingProduct.id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post(`/businesses/${businessId}/products`, payload);
        toast.success('Product added!');
      }
      
      setShowDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/businesses/${businessId}/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      mrp: '',
      sale_price: '',
      image_url: '',
      category: '',
      product_type: 'general',
      bulk_pricing: [],
      is_available: true,
      is_veg: null,
      sizes: [],
      colors: [],
      stock_quantity: ''
    });
    setNewSize('');
    setNewColor('');
    setEditingProduct(null);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      mrp: (product.mrp || product.price || 0).toString(),
      sale_price: (product.sale_price || product.price || 0).toString(),
      image_url: product.image_url || '',
      category: product.category || '',
      product_type: product.product_type || 'general',
      bulk_pricing: product.bulk_pricing || [],
      is_available: product.is_available,
      is_veg: product.is_veg,
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock_quantity: product.stock_quantity?.toString() || ''
    });
    setNewSize('');
    setNewColor('');
    setShowDialog(true);
  };

  const addSize = (size) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: [...formData.sizes, size] });
    }
    setNewSize('');
  };

  const removeSize = (size) => {
    setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) });
  };

  const addColor = (color) => {
    if (color && !formData.colors.includes(color)) {
      setFormData({ ...formData, colors: [...formData.colors, color] });
    }
    setNewColor('');
  };

  const removeColor = (color) => {
    setFormData({ ...formData, colors: formData.colors.filter(c => c !== color) });
  };

  const addBulkPricing = () => {
    setFormData({
      ...formData,
      bulk_pricing: [...formData.bulk_pricing, { min_quantity: '', price_per_unit: '' }]
    });
  };

  const updateBulkPricing = (index, field, value) => {
    const newBulk = [...formData.bulk_pricing];
    newBulk[index][field] = value;
    setFormData({...formData, bulk_pricing: newBulk});
  };

  const removeBulkPricing = (index) => {
    setFormData({
      ...formData,
      bulk_pricing: formData.bulk_pricing.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button data-testid="add-product-btn" onClick={() => { resetForm(); setShowDialog(true); }} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Products & Services</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">Add your first product to get started</p>
            <Button data-testid="add-first-product-btn" onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90 text-white rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} data-testid={`product-card-${product.id}`} className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden group">
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-heading font-semibold">{product.name}</h3>
                    {product.discount_percentage > 0 && (
                      <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                        {product.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  <div className="mb-3">
                    {(product.mrp || product.price) > (product.sale_price || product.price) && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        MRP {'\u20B9'}{product.mrp || product.price}
                      </span>
                    )}
                    <span className="text-xl font-bold text-primary">
                      {'\u20B9'}{product.sale_price || product.price}
                    </span>
                  </div>
                  {product.category && (
                    <span className="inline-block text-xs bg-muted px-2 py-1 rounded-full mb-3">{product.category}</span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.is_available ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {product.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex gap-2">
                      <Button data-testid={`edit-product-${product.id}`} variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button data-testid={`delete-product-${product.id}`} variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                data-testid="product-name-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="productDesc">Description *</Label>
              <Textarea
                id="productDesc"
                data-testid="product-desc-input"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productMRP">MRP {'\u20B9'} *</Label>
                <Input
                  id="productMRP"
                  data-testid="product-mrp-input"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="productPrice">Sale Price {'\u20B9'} *</Label>
                <Input
                  id="productPrice"
                  data-testid="product-price-input"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                  required
                  className="mt-2"
                />
              </div>
            </div>

            {formData.mrp && formData.sale_price && calculateDiscount(parseFloat(formData.mrp), parseFloat(formData.sale_price)) > 0 && (
              <div className="text-sm text-accent font-medium">
                Discount: {calculateDiscount(parseFloat(formData.mrp), parseFloat(formData.sale_price))}% OFF
              </div>
            )}

            <div>
              <Label>Bulk Pricing (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Set lower prices for bulk purchases</p>
              <div className="space-y-2">
                {formData.bulk_pricing.map((bulk, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Min Quantity"
                      type="number"
                      value={bulk.min_quantity}
                      onChange={(e) => updateBulkPricing(idx, 'min_quantity', e.target.value)}
                    />
                    <Input
                      placeholder="Price per unit"
                      type="number"
                      step="0.01"
                      value={bulk.price_per_unit}
                      onChange={(e) => updateBulkPricing(idx, 'price_per_unit', e.target.value)}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeBulkPricing(idx)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addBulkPricing} className="w-full">
                  + Add Bulk Pricing Tier
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productCategory">Category</Label>
                <Input
                  id="productCategory"
                  data-testid="product-category-input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select value={formData.product_type} onValueChange={(value) => setFormData({...formData, product_type: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="productImage">Image URL</Label>
              <Input
                id="productImage"
                data-testid="product-image-input"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Available for sale</Label>
              <Switch
                data-testid="product-available-toggle"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1 rounded-full">
                Cancel
              </Button>
              <Button type="submit" data-testid="submit-product-btn" className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full">
                {editingProduct ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPageEnhanced;