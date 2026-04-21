import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Eye, Filter } from 'lucide-react';
import { Patient } from '../../types';
import { axiosInstance } from '../../services/api';

const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [patients, setPatients] = useState<Array<Patient & { last_visit?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axiosInstance.get('/doctor/patients');
        const rows = Array.isArray(response.data) ? response.data : [];

        const mappedPatients: Array<Patient & { last_visit?: string }> = rows.map((patient: any) => ({
          id: String(patient.patient_id),
          patient_id: `P${String(patient.patient_id).padStart(6, '0')}`,
          full_name: patient.full_name || 'Unknown Patient',
          email: patient.email || '',
          phone: patient.phone || '',
          date_of_birth: patient.date_of_birth || '',
          gender: (patient.gender || 'other').toLowerCase(),
          address: patient.address || '',
          emergency_contact: patient.emergency_contact || '',
          emergency_phone: '',
          medical_history: undefined,
          allergies: patient.allergies || 'None',
          blood_group: patient.blood_group || '—',
          last_visit: patient.last_visit || '',
          created_at: patient.created_at || new Date().toISOString(),
          updated_at: patient.updated_at || patient.created_at || new Date().toISOString(),
        }));

        setPatients(mappedPatients);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || patient.gender === filterGender;
    
    return matchesSearch && matchesGender;
  });

  const getDerivedStatus = (lastVisit: string) => {
    if (!lastVisit) return 'inactive';

    const visitDate = new Date(lastVisit);
    const daysSinceVisit = (Date.now() - visitDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceVisit <= 180 ? 'active' : 'inactive';
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                aria-label="Filter patients by gender"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading patients...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Patient</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Patient ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Age</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Gender</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Blood Group</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => {
                  const status = getDerivedStatus(patient.last_visit || patient.created_at);

                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{patient.full_name}</p>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {patient.patient_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} years` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-gray-900">{patient.gender}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          {patient.blood_group}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {patient.phone}
                        <div className="mt-1">
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="View patient details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            aria-label="Edit patient information"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">No patients found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PatientList;
