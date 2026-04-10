const Joi = require('joi');

const schemas = {
  register: Joi.object({
    nama: Joi.string().pattern(/^[a-zA-Z\s]+$/).required().messages({
      'string.empty': 'Nama harus diisi',
      'string.pattern.base': 'Nama hanya boleh berisi huruf',
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
    }),
    confirm_password: Joi.string().required(),
    agree_terms: Joi.boolean().required()
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

  submitReview: Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    review_text: Joi.string().min(10).max(500).required(),
    display_name: Joi.string().max(100).allow('', null)
  }),

  createCar: Joi.object({
    nama_mobil: Joi.string().required(),
    plat_nomor: Joi.string().pattern(/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/).required(),
    kapasitas_penumpang: Joi.number().integer().min(2).max(20).required(),
    jenis_transmisi: Joi.string().valid('Manual', 'Otomatis', 'manual', 'otomatis').required(),
    harga_per_hari: Joi.number().positive().required()
  }),

  createBooking: Joi.object({
    mobil_id: Joi.number().integer().positive().required(),
    tanggal_pinjam: Joi.string(),
    tanggal_selesai: Joi.string().required(),
    dengan_driver: Joi.string().valid('ya', 'tidak').allow('0', '1'),
    nama_ktp: Joi.string().min(3).max(100),
    nik: Joi.string().pattern(/^\d{16}$/),
    foto_ktp: Joi.string().allow('', null),
    catatan: Joi.string().allow('', null),
    jam_pinjam: Joi.string().allow('', null),
    jam_selesai: Joi.string().allow('', null),
    jenis_layanan: Joi.string().allow('', null),
    nik_ocr: Joi.string().allow('', null),
    user_id: Joi.number().allow(null),
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
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

module.exports = { schemas, validate };