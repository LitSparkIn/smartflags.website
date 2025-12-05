import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, X, Waves, ChevronDown } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const PublicMenu = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [tags, setTags] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchMenuData();
    }
  }, [propertyId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [propertyRes, categoriesRes, itemsRes, tagsRes, restrictionsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/properties/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-categories/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-items/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-tags/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/dietary-restrictions/${propertyId}`)
      ]);

      if (propertyRes.data.success) setProperty(propertyRes.data.property);
      if (categoriesRes.data.success) {
        // Keep all categories to properly display items, but we'll filter by active items
        setCategories(categoriesRes.data.categories);
      }
      if (itemsRes.data.success) {
        // Only show active items on public menu
        const activeItems = itemsRes.data.items.filter(i => i.isActive);
        const sortedItems = activeItems.sort((a, b) => b.priority - a.priority);
        setItems(sortedItems);
      }
      if (tagsRes.data.success) setTags(tagsRes.data.tags);
      if (restrictionsRes.data.success) {
        setRestrictions(restrictionsRes.data.restrictions);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Other';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '🍽️';
  };

  const getTagsByIds = (tagIds) => {
    return tags.filter(t => tagIds.includes(t.id));
  };

  const getRestrictionsByIds = (restrictionIds) => {
    return restrictions.filter(r => restrictionIds.includes(r.id));
  };

  const filteredItems = items.filter(item => {
    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0 && !selectedTags.some(tagId => item.tagIds?.includes(tagId))) {
      return false;
    }

    // Dietary restrictions filter
    if (selectedRestrictions.length > 0 && 
        !selectedRestrictions.every(resId => item.dietaryRestrictionIds?.includes(resId))) {
      return false;
    }

    return true;
  });

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => item.categoryId === category.id);
    if (categoryItems.length > 0) {
      acc[category.id] = categoryItems;
    }
    return acc;
  }, {});

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleRestriction = (restrictionId) => {
    setSelectedRestrictions(prev =>
      prev.includes(restrictionId) ? prev.filter(id => id !== restrictionId) : [...prev, restrictionId]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedRestrictions([]);
    setSelectedCategory('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Waves className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  {property?.name || 'Menu'}
                </h1>
                <p className="text-xs md:text-sm text-slate-500">Our delicious offerings</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedTags.length > 0 || selectedRestrictions.length > 0) && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedTags.length + selectedRestrictions.length}
                </span>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-slate-200 overflow-x-auto">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-2 py-3 min-w-max">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => {
                const count = items.filter(item => item.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category.icon} {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-6xl mx-auto px-4 py-4 bg-white shadow-lg rounded-xl mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white ring-2 ring-offset-2'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color, ringColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {restrictions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Dietary Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {restrictions.map((restriction) => (
                  <button
                    key={restriction.id}
                    onClick={() => toggleRestriction(restriction.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 ${
                      selectedRestrictions.includes(restriction.id)
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-green-300'
                    }`}
                  >
                    {restriction.icon} {restriction.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Items */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-lg text-slate-600">No items found matching your criteria</p>
            <Button onClick={clearFilters} className="mt-4">Clear Filters</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([categoryId, categoryItems]) => (
              <div key={categoryId} className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b-2 border-slate-300">
                  <span className="text-3xl">{getCategoryIcon(categoryId)}</span>
                  <h2 className="text-2xl font-bold text-slate-800">{getCategoryName(categoryId)}</h2>
                  <span className="text-slate-500">({categoryItems.length})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      {item.image ? (
                        <div className="h-48 bg-slate-200 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-6xl opacity-50">{getCategoryIcon(item.categoryId)}</span>
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-slate-900 flex-1">{item.name}</h3>
                          <p className="text-xl font-bold text-blue-600 ml-2">${item.price.toFixed(2)}</p>
                        </div>

                        {item.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                        )}

                        {getTagsByIds(item.tagIds || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {getTagsByIds(item.tagIds).map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {getRestrictionsByIds(item.dietaryRestrictionIds || []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {getRestrictionsByIds(item.dietaryRestrictionIds).map((restriction) => (
                              <span
                                key={restriction.id}
                                className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                              >
                                {restriction.icon} {restriction.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-800 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Waves className="w-5 h-5" />
            <span className="font-semibold">SmartFlags</span>
          </div>
          <p className="text-sm text-slate-400">Powered by SmartFlags Menu System</p>
        </div>
      </div>
    </div>
  );
};
