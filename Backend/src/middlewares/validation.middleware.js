const Joi = require('joi');

// Schema definitions
const schemas = {
  // Auth Schemas
  register: Joi.object({
    nama: Joi.string().alpha().required().messages({
      'string.empty': 'Nama harus diisi',
      'string.alpha': 'Nama hanya boleh berisi huruf',
      'any.required': 'Nama wajib diisi'
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.empty': 'Username harus diisi',
      'string.alphanum': 'Username hanya boleh berisi huruf dan angka',
      'string.min': 'Username minimal 3 karakter',
      'string.max': 'Username maksimal 30 karakter',
      'any.required': 'Username wajib diisi'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email harus diisi',
      'string.email': 'Format email tidak valid',
      'any.required': 'Email wajib diisi'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password harus diisi',
      'string.min': 'Password minimal 6 karakter',
      'any.required': 'Password wajib diisi'
    }),
    no_hp: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
      'string.empty': 'Nomor HP harus diisi',
      'string.pattern.base': 'Nomor HP hanya boleh berisi angka (10-15 digit)',
      'any.required': 'Nomor HP wajib diisi'
    })
  }),

  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username harus diisi',
      'any.required': 'Username wajib diisi'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password harus diisi',
      'any.required': 'Password wajib diisi'
    })
  }),

  // Admin Auth Schemas
  adminLogin: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username harus diisi',
      'any.required': 'Username wajib diisi'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password harus diisi',
      'any.required': 'Password wajib diisi'
    })
  }),

  // Review Schemas
  submitReview: Joi.object({
    booking_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Booking ID harus berupa angka',
      'number.positive': 'Booking ID harus positif',
      'any.required': 'Booking ID wajib diisi'
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.base': 'Rating harus berupa angka',
      'number.min': 'Rating minimal 1',
      'number.max': 'Rating maksimal 5',
      'any.required': 'Rating wajib diisi'
    }),
    review_text: Joi.string().min(10).max(500).required().messages({
      'string.empty': 'Review harus diisi',
      'string.min': 'Review minimal 10 karakter',
      'string.max': 'Review maksimal 500 karakter',
      'any.required': 'Review wajib diisi'
    }),
    display_name: Joi.string().max(100).allow('', null).messages({
      'string.max': 'Nama tampil maksimal 100 karakter'
    })
  }),

  // Car Schemas
  createCar: Joi.object({
    nama_mobil: Joi.string().required().messages({
      'string.empty': 'Nama mobil harus diisi',
      'any.required': 'Nama mobil wajib diisi'
    }),
    plat_nomor: Joi.string().pattern(/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/).required().messages({
      'string.empty': 'Plat nomor harus diisi',
      'string.pattern.base': 'Format plat nomor tidak valid (contoh: AB 1234 CD)',
      'any.required': 'Plat nomor wajib diisi'
    }),
    kapasitas_penumpang: Joi.number().integer().min(2).max(20).required().messages({
      'number.base': 'Kapasitas harus berupa angka',
      'number.min': 'Kapasitas minimal 2 orang',
      'any.required': 'Kapasitas wajib diisi'
    }),
    jenis_transmisi: Joi.string().valid('Manual', 'Otomatis').required().messages({
      'any.only': 'Transmisi hanya boleh Manual atau Otomatis',
      'any.required': 'Transmisi wajib diisi'
    }),
    harga_per_hari: Joi.number().positive().required().messages({
      'number.base': 'Harga harus berupa angka',
      'number.positive': 'Harga harus positif',
      'any.required': 'Harga wajib diisi'
    })
  }),

  // Booking Schemas
  createBooking: Joi.object({
    mobil_id: Joi.number().integer().positive().required().messages({
      'number.base': 'ID mobil harus berupa angka',
      'number.positive': 'ID mobil harus positif',
      'any.required': 'ID mobil wajib diisi'
    }),
    tanggal_pinjam: Joi.date().iso().required().messages({
      'date.base': 'Format tanggal tidak valid',
      'date.iso': 'Gunakan format ISO (YYYY-MM-DD)',
      'any.required': 'Tanggal pinjam wajib diisi'
    }),
    tanggal_selesai: Joi.date().iso().required().messages({
      'date.base': 'Format tanggal tidak valid',
      'date.iso': 'Gunakan format ISO (YYYY-MM-DD)',
      'any.required': 'Tanggal selesai wajib diisi'
    }),
    dengan_driver: Joi.string().valid('ya', 'tidak').allow('0', '1').messages({
      'any.only': 'Nilai dengan_driver hanya ya/tidak atau 0/1'
    }),
    nama_customer: Joi.string().min(3).max(100).messages({
      'string.min': 'Nama minimal 3 karakter',
      'string.max': 'Nama maksimal 100 karakter'
    }),
    email: Joi.string().email().messages({
      'string.email': 'Format email tidak valid'
    }),
    no_hp: Joi.string().pattern(/^[0-9]{10,15}$/).messages({
      'string.pattern.base': 'Nomor HP hanya boleh berisi angka (10-15 digit)'
    })
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // remove unknown properties
    });

    if (error) {
      const messages = error.details.map(d => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  schemas,
  validate
};
