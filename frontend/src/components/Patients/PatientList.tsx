import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Filter } from 'lucide-react';
import { Patient } from '../../types';

const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  // Mock patient data
  const [patients] = useState<Patient[]>([
    {
      id: '1',
      patient_id: 'P001234',
      full_name: 'Nimal Perera',
      email: 'nimal.perera@email.com',
      phone: '+94771234567',
      date_of_birth: '1985-06-15',
      gender: 'male',
      address: '123/A, Galle Road, Colombo 03',
      emergency_contact: 'Sumudu Perera',
      emergency_phone: '+94771234568',
      blood_group: 'O+',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      patient_id: 'P001235',
      full_name: 'Kamani Silva',
      email: 'kamani.silva@email.com',
      phone: '+94712345678',
      date_of_birth: '1990-03-22',
      gender: 'female',
      address: '45, Kandy Road, Kadawatha',
      emergency_contact: 'Ruwan Silva',
      emergency_phone: '+94712345679',
      blood_group: 'A-',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      patient_id: 'P001236',
      full_name: 'Sunil Fernando',
      email: 'sunil.fernando@email.com',
      phone: '+94773456789',
      date_of_birth: '1978-11-08',
      gender: 'male',
      address: '78/B, Temple Road, Nugegoda',
      emergency_contact: 'Nimali Fernando',
      emergency_phone: '+94773456780',
      blood_group: 'B+',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    }
  ]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || patient.gender === filterGender;
    
    return matchesSearch && matchesGender;
  });

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

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              {filteredPatients.map((patient) => (
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
                    {calculateAge(patient.date_of_birth)} years
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
              ))}
            </tbody>
          </table>
        </div>
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