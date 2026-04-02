const db = require('../config/db');

// Submit review untuk completed booking
exports.submitReview = async (req, res) => {
  try {
    const { booking_id, rating, review_text, display_name } = req.body;
    const user_id = req.user?.id;

    // Validation
    if (!booking_id || !rating || !review_text) {
      return res.status(400).json({
        success: false,
        message: 'booking_id, rating, dan review_text wajib diisi'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus antara 1-5'
      });
    }

    if (review_text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review minimal 10 karakter'
      });
    }

    // Check if booking exists and belongs to user
    const { data: booking, error: bookingError } = await db
      .from('sewa')
      .select('id, user_id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking tidak ditemukan'
      });
    }

    // Verify ownership
    if (booking.user_id && booking.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }

    // Check if already reviewed
    const { data: existingReview } = await db
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Booking ini sudah direview sebelumnya'
      });
    }

    // Insert review
    const { data: newReview, error: insertError } = await db
      .from('reviews')
      .insert({
        booking_id,
        user_id: user_id || null,
        rating,
        review_text: review_text.trim(),
        display_name: display_name?.trim() || null
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.json({
      success: true,
      message: 'Review berhasil disimpan',
      data: newReview
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan review',
      error: error.message
    });
  }
};

// Get all public reviews (rating >= 4)
exports.getAllReviews = async (req, res) => {
  try {
    const { data: reviews, error } = await db
      .from('reviews')
      .select(`
        id,
        rating,
        review_text,
        display_name,
        created_at,
        user_id,
        users!inner(nama)
      `)
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Map display_name fallback
    const mappedReviews = reviews.map(review => ({
      ...review,
      display_name: review.display_name || review.users?.nama || 'Pelanggan Kami'
    }));

    res.json({
      success: true,
      data: mappedReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil review',
      error: error.message
    });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { data: reviews, error } = await db
      .from('reviews')
      .select(`
        id,
        booking_id,
        rating,
        review_text,
        display_name,
        created_at,
        sewa(tanggal_pinjam, tanggal_selesai, mobil(nama_mobil))
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil review user',
      error: error.message
    });
  }
};

// Check if booking already has a review
exports.getBookingReviewStatus = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const { data: review, error } = await db
      .from('reviews')
      .select('id, rating, review_text, display_name')
      .eq('booking_id', booking_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      hasReview: !!review,
      data: review || null
    });
  } catch (error) {
    console.error('Error checking review status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengecek status review',
      error: error.message
    });
  }
};
