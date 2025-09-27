#!/bin/bash

echo "🔍 ADMIN FEATURES VALIDATION CHECK"
echo "=================================="

# Check 1: File Structure
echo -e "\n1. 📁 File Structure Check:"
if find src/pages/Admin -name "*.jsx" | grep -q .; then
    echo "✅ Admin files exist in correct location"
    find src/pages/Admin -name "*.jsx" | while read file; do
        echo "   📄 $file"
    done
else
    echo "❌ Admin files missing or wrong location"
fi

# Check 2: ParcelMap Integration
echo -e "\n2. ��️ ParcelMap Integration:"
map_count=$(grep -c "ParcelMap" src/pages/Admin/AdminParcelManage.jsx)
if [ $map_count -ge 2 ]; then
    echo "✅ ParcelMap integrated (found $map_count occurrences)"
else
    echo "❌ ParcelMap not properly integrated (found $map_count occurrences)"
fi

# Check 3: ParcelTimeline Integration
echo -e "\n3. 📊 ParcelTimeline Integration:"
timeline_count=$(grep -c "ParcelTimeline" src/pages/Admin/AdminParcelManage.jsx)
if [ $timeline_count -ge 2 ]; then
    echo "✅ ParcelTimeline integrated (found $timeline_count occurrences)"
else
    echo "❌ ParcelTimeline not properly integrated"
fi

# Check 4: Status Flow
echo -e "\n4. 🔄 Status Flow (CREATED → DELIVERED):"
if grep -q "created.*in_transit.*delivered" src/pages/Admin/AdminParcelManage.jsx; then
    echo "✅ Status progression implemented"
else
    echo "❌ Status flow missing or incomplete"
fi

# Check 5: Location Update Methods
echo -e "\n5. 📍 Location Update Methods:"
location_methods=0
if grep -q "handleLocationSelect" src/pages/Admin/AdminParcelManage.jsx; then
    echo "✅ Map click location updates"
    ((location_methods++))
fi
if grep -q "Latitude.*Longitude" src/pages/Admin/AdminParcelManage.jsx; then
    echo "✅ Coordinate input fields"
    ((location_methods++))
fi
if grep -q "Current Location" src/pages/Admin/AdminParcelManage.jsx; then
    echo "✅ Text input location"
    ((location_methods++))
fi
echo "   Total location methods: $location_methods/3"

# Check 6: Real-time Updates
echo -e "\n6. ⚡ Real-time Updates:"
if grep -q "fetchParcelDetails" src/pages/Admin/AdminParcelManage.jsx; then
    echo "✅ Data refresh mechanism implemented"
else
    echo "❌ Real-time updates not implemented"
fi

# Check 7: Dashboard Features
echo -e "\n7. 📊 Dashboard Features:"
if grep -q "Table" src/pages/Admin/AdminDashboard.jsx; then
    echo "✅ Table display implemented"
fi
if grep -q "filter\|search" src/pages/Admin/AdminDashboard.jsx; then
    echo "✅ Filter/search functionality"
fi
if grep -q "Manage" src/pages/Admin/AdminDashboard.jsx; then
    echo "✅ Manage action buttons"
fi

echo -e "\n=================================="
echo "VALIDATION COMPLETE 🎯"
